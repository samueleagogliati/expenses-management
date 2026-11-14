// OCR dello scontrino interamente nel browser (nessun dato lascia il dispositivo).
// I file di Tesseract sono serviti da /ocr (copiati da scripts/copy-ocr.mjs).

let workerPromise = null

async function getWorker(onProgress) {
  if (!workerPromise) {
    workerPromise = import('tesseract.js').then(({ createWorker }) =>
      createWorker('ita', 1, {
        workerPath: '/ocr/worker.min.js',
        corePath: '/ocr',
        langPath: '/ocr',
        gzip: true,
        logger: (m) => {
          if (m.status === 'recognizing text') onProgress?.(m.progress)
        },
      }),
    )
    workerPromise.catch(() => (workerPromise = null))
  }
  return workerPromise
}

// Scala di grigi + stiramento del contrasto: migliora molto la lettura
function preprocess(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = img.width < 1400 ? 1400 / img.width : 1
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0, c.width, c.height)
      const d = ctx.getImageData(0, 0, c.width, c.height)
      const px = d.data
      let min = 255
      let max = 0
      for (let i = 0; i < px.length; i += 4) {
        const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
        px[i] = g
        if (g < min) min = g
        if (g > max) max = g
      }
      const range = Math.max(1, max - min)
      for (let i = 0; i < px.length; i += 4) {
        const v = ((px[i] - min) * 255) / range
        px[i] = px[i + 1] = px[i + 2] = v
      }
      ctx.putImageData(d, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Immagine non valida'))
    img.src = dataUrl
  })
}

const SKIP =
  /\b(sub\s?totale|totale|resto|contanti|contante|pagamento|pagato|carta|bancomat|iva|imponibile|importo|elenco|documento|commerciale|scontrino|codice|punti|saldo|arrotond|cassa|cassiere|data|ora|tel|p\.?\s?iva|via|piazza|grazie|n\.?\s?articol|pezzi|di cui)\b/i

const PRICE = /(-?\s?\d{1,4}[.,]\d{2})(?!\d)/g

const toNumber = (s) => parseFloat(s.replace(/\s/g, '').replace(',', '.'))

const pad = (n) => String(n).padStart(2, '0')

// Cerca la data dello scontrino: gg/mm/aaaa, gg-mm-aa, gg.mm.aaaa, aaaa-mm-gg
export function parseReceiptDate(text) {
  const now = new Date()
  const maxTime = now.getTime() + 24 * 3600 * 1000
  const candidates = []

  for (const m of text.matchAll(/(?<!\d)(\d{1,2})\s?[/.\-]\s?(\d{1,2})\s?[/.\-]\s?(\d{4}|\d{2})(?!\d)/g)) {
    let [, d, mo, y] = m
    y = y.length === 2 ? 2000 + Number(y) : Number(y)
    candidates.push([y, Number(mo), Number(d)])
  }
  for (const m of text.matchAll(/(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/g)) {
    candidates.push([Number(m[1]), Number(m[2]), Number(m[3])])
  }

  for (const [y, mo, d] of candidates) {
    const date = new Date(y, mo - 1, d)
    const valid =
      date.getFullYear() === y &&
      date.getMonth() === mo - 1 &&
      date.getDate() === d
    if (valid && y >= 2015 && date.getTime() <= maxTime) {
      return `${y}-${pad(mo)}-${pad(d)}`
    }
  }
  return null
}

export function parseReceiptText(text) {
  const items = []
  let total = null

  for (const raw of text.split('\n')) {
    const line = raw.replace(/[|_~]/g, ' ').replace(/\s+/g, ' ').trim()
    if (line.length < 4) continue

    const prices = [...line.matchAll(PRICE)]
    if (!prices.length) continue

    // totale: riga con TOTALE (ma non SUBTOTALE) → ultimo prezzo
    if (/\btotale\b/i.test(line) && !/sub\s?totale/i.test(line)) {
      if (/complessivo|euro|€|\btotale\b/i.test(line)) {
        total = toNumber(prices[prices.length - 1][1])
      }
      continue
    }
    if (SKIP.test(line)) continue

    const last = prices[prices.length - 1]
    let price = toNumber(last[1])
    let description = line
      .slice(0, last.index)
      .replace(/^[\d\s.,x*×]+(?=[A-Za-zÀ-ÿ])/, '') // codici/quantità iniziali
      .replace(/[\s€*.:-]+$/, '')
      .trim()

    // "2 x 1,50 = 3,00" o quantità: tieni il totale riga (ultimo prezzo)
    if (!/[A-Za-zÀ-ÿ]{2}/.test(description)) continue

    // gli sconti spesso hanno la parola SCONTO senza segno meno
    if (/\bsconto|promo|offerta|riduz/i.test(description) && price > 0) {
      price = -price
    }
    items.push({ description, price })
  }
  return { items, total, date: parseReceiptDate(text) }
}

export async function scanReceipt(dataUrl, onProgress) {
  const [worker, image] = await Promise.all([
    getWorker(onProgress),
    preprocess(dataUrl),
  ])
  const { data } = await worker.recognize(image)
  return parseReceiptText(data.text || '')
}

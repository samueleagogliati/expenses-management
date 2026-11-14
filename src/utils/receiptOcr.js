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

// Due varianti dell'immagine: scala di grigi con contrasto, e binarizzata
// con soglia adattiva (regge meglio ombre, pieghe e luce non uniforme).
function preprocess(dataUrl, mode) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const target = 2000
      const scale = img.width < target ? target / img.width : 1
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      const d = ctx.getImageData(0, 0, w, h)
      const px = d.data
      const gray = new Uint8ClampedArray(w * h)
      let min = 255
      let max = 0
      for (let i = 0, j = 0; i < px.length; i += 4, j++) {
        const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
        gray[j] = g
        if (g < min) min = g
        if (g > max) max = g
      }

      let out = gray
      if (mode === 'bin') {
        // soglia adattiva con immagine integrale: pixel scuro se < media locale - 10%
        const integral = new Float64Array((w + 1) * (h + 1))
        for (let y = 0; y < h; y++) {
          let row = 0
          for (let x = 0; x < w; x++) {
            row += gray[y * w + x]
            integral[(y + 1) * (w + 1) + x + 1] = integral[y * (w + 1) + x + 1] + row
          }
        }
        const r = Math.max(15, Math.round(w / 24))
        out = new Uint8ClampedArray(w * h)
        for (let y = 0; y < h; y++) {
          const y0 = Math.max(0, y - r)
          const y1 = Math.min(h, y + r + 1)
          for (let x = 0; x < w; x++) {
            const x0 = Math.max(0, x - r)
            const x1 = Math.min(w, x + r + 1)
            const sum =
              integral[y1 * (w + 1) + x1] -
              integral[y0 * (w + 1) + x1] -
              integral[y1 * (w + 1) + x0] +
              integral[y0 * (w + 1) + x0]
            const mean = sum / ((x1 - x0) * (y1 - y0))
            out[y * w + x] = gray[y * w + x] < mean * 0.9 ? 0 : 255
          }
        }
      } else {
        const range = Math.max(1, max - min)
        out = gray.map((v) => ((v - min) * 255) / range)
      }

      for (let i = 0, j = 0; i < px.length; i += 4, j++) {
        px[i] = px[i + 1] = px[i + 2] = out[j]
      }
      ctx.putImageData(d, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Immagine non valida'))
    img.src = dataUrl
  })
}

// Corregge le confusioni tipiche dell'OCR nel prezzo a fine riga (O→0, l→1, S→5…)
function fixTrailingPrice(line) {
  return line.replace(
    /([\dOoIlSsB|]{1,4})\s?[.,]\s?([\dOoIlSsB|]{2})(\s*[A-Za-z*]?)\s*$/,
    (m, a, b, tail) => {
      const fix = (t) =>
        t.replace(/[Oo]/g, '0').replace(/[Il|]/g, '1').replace(/[Ss]/g, '5').replace(/B/g, '8')
      return `${fix(a)},${fix(b)}${tail}`
    },
  )
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

export function parseReceiptText(text, lineConf = []) {
  const items = []
  let total = null

  const rawLines = text.split('\n')
  for (let li = 0; li < rawLines.length; li++) {
    const raw = rawLines[li]
    const line = fixTrailingPrice(
      raw.replace(/[|_~]/g, ' ').replace(/\s+/g, ' ').trim(),
    )
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
    items.push({ description, price, check: (lineConf[li] ?? 100) < 70 })
  }
  return { items, total, date: parseReceiptDate(text) }
}

// Punteggio di un risultato: più è alto, più è affidabile
function score(res) {
  if (!res.items.length) return -Infinity
  const sum = res.items.reduce((acc, i) => acc + i.price, 0)
  let sc = res.items.length
  if (res.total !== null) {
    const diff = Math.abs(sum - res.total)
    sc += diff < 0.015 ? 1000 : -Math.min(diff, 100)
  }
  sc -= res.items.filter((i) => i.check).length * 0.5
  return sc
}

async function recognizeVariant(worker, dataUrl, mode) {
  const image = await preprocess(dataUrl, mode)
  const { data } = await worker.recognize(image, {}, { text: true, blocks: true })
  // confidenza per riga, allineata alle righe del testo
  const lines = (data.blocks || []).flatMap((b) =>
    b.paragraphs.flatMap((p) => p.lines),
  )
  const text = lines.length ? lines.map((l) => l.text.trim()).join('\n') : data.text
  const conf = lines.length ? lines.map((l) => l.confidence) : []
  return parseReceiptText(text || '', conf)
}

export async function scanReceipt(dataUrl, onProgress) {
  let pass = 0
  const worker = await getWorker((p) => onProgress?.((pass + p) / 2))
  await worker.setParameters({
    tessedit_pageseg_mode: '6', // un unico blocco di testo: ideale per scontrini
    preserve_interword_spaces: '1',
    user_defined_dpi: '300',
  })

  const results = []
  for (const mode of ['gray', 'bin']) {
    try {
      results.push(await recognizeVariant(worker, dataUrl, mode))
    } catch (e) {
      console.warn('OCR variante fallita:', mode, e)
    }
    pass++
    onProgress?.(pass / 2)
  }
  if (!results.length) throw new Error('OCR non riuscito')
  return results.sort((a, b) => score(b) - score(a))[0]
}

// Accetta "12,5", "12.5", "1.234,56", "1,234.56", " 12 €" -> numero (NaN se non valido)
export function parseDecimal(value) {
  if (typeof value === 'number') return value
  if (value === null || value === undefined) return NaN
  let s = String(value).replace(/[€\s]/g, '')
  if (!s) return NaN
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  if (lastComma > -1 && lastDot > -1) {
    // l'ultimo separatore è quello decimale
    s =
      lastComma > lastDot
        ? s.replace(/\./g, '').replace(',', '.')
        : s.replace(/,/g, '')
  } else if (lastComma > -1) {
    s = s.replace(',', '.')
  }
  if (!/^-?\d*\.?\d+$|^-?\d+\.$/.test(s)) return NaN
  return parseFloat(s)
}

export function isValidDecimal(value) {
  return !Number.isNaN(parseDecimal(value))
}

const eur = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
})
const eurCompact = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatEuro(value) {
  const n = parseDecimal(value)
  return eur.format(Number.isNaN(n) ? 0 : n)
}

export function formatEuroCompact(value) {
  const n = parseDecimal(value)
  return eurCompact.format(Number.isNaN(n) ? 0 : n)
}

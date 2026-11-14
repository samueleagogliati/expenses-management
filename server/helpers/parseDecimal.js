export default function parseDecimal(value) {
  if (typeof value === 'number') return value
  if (value === null || value === undefined) return NaN
  let s = String(value).replace(/[€\s]/g, '')
  if (!s) return NaN
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  if (lastComma > -1 && lastDot > -1) {
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

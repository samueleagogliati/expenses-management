// Copia i file OCR (worker, core wasm, lingua italiana) in public/ocr
// così il riconoscimento funziona in locale, senza CDN esterne.
import { cpSync, mkdirSync, existsSync } from 'node:fs'

const out = 'public/ocr'
const files = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  [
    'node_modules/@tesseract.js-data/ita/4.0.0_best_int/ita.traineddata.gz',
    'ita.traineddata.gz',
  ],
]
for (const core of [
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-relaxedsimd-lstm.wasm.js',
]) {
  files.push([`node_modules/tesseract.js-core/${core}`, core])
}

mkdirSync(out, { recursive: true })
for (const [src, name] of files) {
  if (existsSync(src)) cpSync(src, `${out}/${name}`)
  else console.warn('OCR: file mancante', src)
}

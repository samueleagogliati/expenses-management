<template>
  <button
    class="btn scan-btn"
    type="button"
    data-bs-toggle="modal"
    data-bs-target="#receiptModal"
    @click="reset"
  >
    <i class="bi bi-camera" aria-hidden="true"></i>
    <span>Scansiona scontrino</span>
  </button>

  <div
    class="modal fade"
    id="receiptModal"
    ref="modalEl"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5">Scontrino</h2>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Chiudi"
          ></button>
        </div>

        <div class="modal-body">
          <!-- 1. scelta foto -->
          <div v-if="step === 'pick'" class="pick">
            <label class="drop" :class="{ has: preview }">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                class="visually-hidden"
                @change="onFile"
              />
              <img v-if="preview" :src="preview" alt="Anteprima scontrino" />
              <template v-else>
                <i class="bi bi-camera-fill" aria-hidden="true"></i>
                <strong>Scatta o scegli una foto</strong>
                <span>Inquadra lo scontrino ben illuminato e dritto</span>
              </template>
            </label>
            <p v-if="error" class="text-danger small mb-0">{{ error }}</p>
          </div>

          <!-- 2. analisi -->
          <div v-else-if="step === 'loading'" class="loading">
            <span class="spinner-border text-primary" aria-hidden="true"></span>
            <p>Sto leggendo lo scontrino… {{ Math.round(progress * 100) }}%</p>
            <small>Elaborazione sul tuo dispositivo, la foto non viene inviata.</small>
          </div>

          <!-- 3. assegnazione -->
          <div v-else class="review">
            <div class="date-row">
              <span>Data scontrino <small v-if="!dateFound">(non trovata: controlla)</small></span>
              <DateField v-model="receiptDate" input-class="df-input df-small" />
            </div>
            <p class="hint">
              Assegna ogni voce a una persona. Le voci <b>Comune</b> vengono
              divise in parti uguali.
            </p>

            <div class="bulk">
              <span>Tutte a:</span>
              <button
                v-for="o in owners"
                :key="o.id"
                type="button"
                class="mini"
                @click="assignAll(o.id)"
              >
                {{ o.label }}
              </button>
            </div>

            <ul class="items">
              <li
                v-for="item in items"
                :key="item.id"
                class="item"
                :class="{ pending: item.owner === null }"
              >
                <div class="item-top">
                  <input
                    v-model="item.description"
                    class="item-desc"
                    aria-label="Descrizione"
                  />
                  <input
                    v-model="item.price"
                    class="item-price"
                    inputmode="decimal"
                    aria-label="Prezzo"
                  />
                  <button
                    type="button"
                    class="item-del"
                    aria-label="Rimuovi voce"
                    @click="removeItem(item.id)"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <div class="chips" role="group" aria-label="Di chi è">
                  <button
                    v-for="o in owners"
                    :key="o.id"
                    type="button"
                    class="chip"
                    :class="{ active: item.owner === o.id }"
                    @click="item.owner = o.id"
                  >
                    {{ o.label }}
                  </button>
                </div>
              </li>
            </ul>

            <button type="button" class="add-line" @click="addItem">
              <i class="bi bi-plus-lg"></i> Aggiungi voce
            </button>

            <div class="totals">
              <div v-for="o in owners" :key="o.id" class="trow">
                <span>{{ o.label }}</span>
                <b>{{ formatEuro(ownerTotals[o.id] || 0) }}</b>
              </div>
              <div class="trow grand">
                <span>Totale</span>
                <b>{{ formatEuro(grandTotal) }}</b>
              </div>
              <div v-if="receiptTotal !== null && mismatch" class="warn">
                <i class="bi bi-exclamation-triangle"></i>
                Il totale dello scontrino è {{ formatEuro(receiptTotal) }}:
                controlla le voci.
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <template v-if="step === 'pick'">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!imageData"
              @click="analyze"
            >
              Analizza
            </button>
          </template>
          <template v-else-if="step === 'review'">
            <button type="button" class="btn btn-light" @click="reset">
              Nuova foto
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!canApply"
              @click="apply"
            >
              {{
                pendingCount
                  ? `Assegna ancora ${pendingCount} voci`
                  : 'Usa nel form'
              }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Modal from 'bootstrap/js/dist/modal'
import { toast } from 'vue3-toastify'
import { scanReceipt } from '../../utils/receiptOcr'
import { formatEuro, parseDecimal } from '../../utils/number'
import { format } from 'date-fns'
import DateField from './DateField.vue'

const props = defineProps({
  users: { type: Array, default: () => [] },
})
const emit = defineEmits(['apply'])

const modalEl = ref(null)
const step = ref('pick')
const preview = ref(null)
const imageData = ref(null)
const error = ref('')
const progress = ref(0)
const dateFound = ref(false)
const items = ref([])
const receiptTotal = ref(null)
const receiptDate = ref(format(new Date(), 'yyyy-MM-dd'))
let seq = 0

const owners = computed(() => [
  ...props.users.map((u) => ({ id: u.id, label: u.firstname })),
  { id: 'common', label: 'Comune' },
])

const reset = () => {
  step.value = 'pick'
  preview.value = null
  imageData.value = null
  error.value = ''
  items.value = []
  receiptTotal.value = null
  receiptDate.value = format(new Date(), 'yyyy-MM-dd')
}

// Decodifica l'immagine (con orientamento EXIF corretto) e la ridimensiona
const decode = async (file) => {
  if (window.createImageBitmap) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // ripiego sull'elemento <img>
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('decode'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

const compress = async (file, maxSide = 1800) => {
  const img = await decode(file)
  const w = img.width || img.naturalWidth
  const h = img.height || img.naturalHeight
  const scale = Math.min(1, maxSide / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  img.close?.()
  return canvas.toDataURL('image/jpeg', 0.85)
}

const onFile = async (e) => {
  const input = e.target
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  try {
    const dataUrl = await compress(file)
    preview.value = dataUrl
    imageData.value = dataUrl.split(',')[1]
  } catch (err) {
    console.error('Lettura foto fallita:', file.type, file.size, err)
    const heic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
    error.value = heic
      ? 'Formato HEIC non supportato da questo browser. Scatta la foto direttamente dal telefono oppure usa Safari.'
      : 'Impossibile leggere la foto. Prova con un\'altra immagine (JPG o PNG).'
  } finally {
    input.value = '' // permette di riselezionare lo stesso file
  }
}

const analyze = async () => {
  step.value = 'loading'
  try {
    progress.value = 0
    const resp = await scanReceipt(preview.value, (p) => (progress.value = p))
    if (!resp.items.length) {
      throw new Error(
        'Non sono riuscito a leggere le voci. Riprova con una foto più nitida e dritta.',
      )
    }
    items.value = resp.items.map((i) => ({
      id: ++seq,
      description: i.description,
      price: i.price.toFixed(2).replace('.', ','),
      owner: null,
    }))
    receiptTotal.value = resp.total
    receiptDate.value = resp.date || format(new Date(), 'yyyy-MM-dd')
    dateFound.value = !!resp.date
    step.value = 'review'
  } catch (e) {
    console.error(e)
    error.value = e.message || 'Impossibile leggere lo scontrino'
    step.value = 'pick'
  }
}

const addItem = () =>
  items.value.push({ id: ++seq, description: '', price: '', owner: null })
const removeItem = (id) => {
  items.value = items.value.filter((i) => i.id !== id)
}
const assignAll = (owner) => items.value.forEach((i) => (i.owner = owner))

const cents = (v) => {
  const n = parseDecimal(v)
  return Number.isNaN(n) ? 0 : Math.round(n * 100)
}

const pendingCount = computed(
  () => items.value.filter((i) => i.owner === null).length,
)
const canApply = computed(
  () => items.value.length > 0 && pendingCount.value === 0 && grandCents.value > 0,
)

const grandCents = computed(() =>
  items.value.reduce((sum, i) => sum + cents(i.price), 0),
)
const grandTotal = computed(() => grandCents.value / 100)
const mismatch = computed(
  () =>
    receiptTotal.value !== null &&
    Math.abs(grandCents.value - Math.round(receiptTotal.value * 100)) > 1,
)

// Totale per persona in centesimi: le voci "comune" divise equamente,
// il resto dei centesimi va alle prime persone così la somma torna.
const splitsCents = computed(() => {
  const result = Object.fromEntries(props.users.map((u) => [u.id, 0]))
  let common = 0
  for (const i of items.value) {
    const c = cents(i.price)
    if (i.owner === 'common') common += c
    else if (i.owner !== null && i.owner in result) result[i.owner] += c
  }
  const n = props.users.length
  if (n) {
    const base = Math.trunc(common / n)
    let rest = common - base * n
    props.users.forEach((u) => {
      result[u.id] += base + (rest > 0 ? 1 : rest < 0 ? -1 : 0)
      rest += rest > 0 ? -1 : rest < 0 ? 1 : 0
    })
  }
  return result
})

const ownerTotals = computed(() => {
  const t = {}
  props.users.forEach((u) => (t[u.id] = splitsCents.value[u.id] / 100))
  // riga "Comune": mostra il totale delle voci comuni (prima della divisione)
  t.common =
    items.value
      .filter((i) => i.owner === 'common')
      .reduce((s, i) => s + cents(i.price), 0) / 100
  return t
})

const apply = () => {
  const splits = {}
  props.users.forEach((u) => (splits[u.id] = splitsCents.value[u.id] / 100))
  emit('apply', {
    price: grandTotal.value,
    splits,
    description: 'Spesa',
    date: receiptDate.value,
  })
  Modal.getOrCreateInstance(modalEl.value).hide()
  toast.success('Scontrino applicato: controlla e salva')
}
</script>

<style scoped>
.scan-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-ink);
  font-weight: 650;
  transition:
    border-color 140ms ease,
    color 140ms ease;
}

.scan-btn:hover {
  border-color: var(--app-primary);
  color: var(--app-primary);
}

.scan-btn .bi {
  color: var(--app-primary);
}

.drop {
  display: flex;
  min-height: 14rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1rem;
  border: 2px dashed var(--app-border);
  border-radius: 1.1rem;
  color: var(--app-muted);
  text-align: center;
  cursor: pointer;
  transition: border-color 140ms ease;
}

.drop:hover {
  border-color: var(--app-primary);
}

.drop .bi {
  color: var(--app-primary);
  font-size: 2.4rem;
}

.drop strong {
  color: var(--app-ink);
}

.drop.has {
  padding: 0.5rem;
  border-style: solid;
}

.drop img {
  max-width: 100%;
  max-height: 22rem;
  border-radius: 0.8rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
  color: var(--app-muted);
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.88rem;
  font-weight: 650;
}

.date-row small {
  color: #d97706;
  font-weight: 500;
}

.date-row > :last-child {
  width: 9.5rem;
}

.hint {
  margin-bottom: 0.75rem;
  color: var(--app-muted);
  font-size: 0.88rem;
}

.bulk {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
  color: var(--app-muted);
  font-size: 0.8rem;
}

.mini {
  padding: 0.15rem 0.65rem;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: transparent;
  color: var(--app-muted);
  font-size: 0.78rem;
  font-weight: 650;
}

.mini:hover {
  border-color: var(--app-primary);
  color: var(--app-primary);
}

.items {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--app-border);
  border-radius: 0.9rem;
  background: var(--app-surface);
  transition: border-color 140ms ease;
}

.item.pending {
  border-color: color-mix(in srgb, #f59e0b 55%, var(--app-border));
}

.item-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-desc,
.item-price {
  min-width: 0;
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--app-ink);
  font-size: 0.92rem;
}

.item-desc {
  flex: 1;
  font-weight: 600;
}

.item-price {
  width: 4.5rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  text-align: right;
}

.item-desc:focus,
.item-price:focus {
  border-bottom-color: var(--app-primary);
  outline: 0;
}

.item-del {
  display: grid;
  width: 1.7rem;
  height: 1.7rem;
  flex: none;
  place-items: center;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--app-muted);
  font-size: 0.75rem;
}

.item-del:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.55rem;
}

.chip {
  padding: 0.25rem 0.8rem;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: transparent;
  color: var(--app-muted);
  font-size: 0.8rem;
  font-weight: 650;
  transition:
    background-color 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
}

.chip:hover {
  border-color: var(--app-primary);
  color: var(--app-primary);
}

.chip.active {
  border-color: transparent;
  background: var(--app-primary);
  color: #fff;
}

.add-line {
  margin-top: 0.75rem;
  padding: 0.3rem 0.4rem;
  border: 0;
  background: transparent;
  color: var(--app-primary);
  font-size: 0.88rem;
  font-weight: 650;
}

.totals {
  display: grid;
  gap: 0.35rem;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--app-primary) 7%, transparent);
}

.trow {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

.trow.grand {
  margin-top: 0.3rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--app-border);
  font-size: 1rem;
}

.warn {
  margin-top: 0.3rem;
  color: #d97706;
  font-size: 0.8rem;
}
</style>

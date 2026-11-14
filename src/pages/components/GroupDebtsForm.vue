<template>
  <ValidatedForm
    ref="debtFormValidator"
    form-id="debtForm"
    :fields="fields"
    @success="onSuccess"
    @fail="onFail"
  >
    <div class="container mt-3">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="card p-3 p-md-4 form-card">
            <div class="card-body">
              <div class="row justify-content-center mb-4">
                <div class="col-12 col-sm-6">
                  <DateField v-model="debtDate" input-class="df-input text-center" />
                </div>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-4 col-md-3">
                  <input
                    v-model="price"
                    autocomplete="off"
                    id="price"
                    name="price"
                    class="form-control"
                    inputmode="decimal"
                    placeholder="€ 0,00"
                  />
                </div>
                <div class="col-8 col-md-5">
                  <input
                    v-model="description"
                    autocomplete="off"
                    id="description"
                    name="description"
                    type="text"
                    class="form-control"
                    placeholder="Descrizione"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <select
                    v-model="selectedCategory"
                    id="category"
                    name="category"
                    class="form-select"
                  >
                    <option
                      v-for="category in categories"
                      :value="category.id"
                      :key="category.id"
                    >
                      {{ category.description }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="row g-3 mt-2">
                <div class="col-12 col-sm-6">
                  <label for="payerId" class="form-label">Chi ha pagato</label>
                  <select v-model="payerId" id="payerId" class="form-select">
                    <option
                      v-for="user in groupUsers"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.firstname }}
                    </option>
                  </select>
                </div>
                <div class="col-12 col-sm-6">
                  <label for="splitType" class="form-label">Dividi spesa</label>
                  <select
                    v-model="splitType"
                    id="splitType"
                    class="form-select"
                  >
                    <option value="equal">Equamente</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div v-if="splitType === 'custom'" class="mt-4">
                <div
                  v-for="user in groupUsers"
                  :key="user.id"
                  class="input-group mb-2"
                >
                  <span class="input-group-text">{{ user.firstname }}</span>
                  <input
                    class="form-control"
                    v-model="customSplits[user.id]"
                    inputmode="decimal"
                    @input="adjustCustomSplits(user.id)"
                  />
                </div>
              </div>

              <div class="text-center mt-4">
                <button
                  class="btn btn-primary save-btn"
                  type="submit"
                >
                  {{ isEditMode ? 'Aggiorna' : 'Salva' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ValidatedForm>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import callService from '../../services/api'
import ValidatedForm from './ValidatedForm.vue'
import DateField from './DateField.vue'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { isValidDecimal, parseDecimal } from '../../utils/number'

const emit = defineEmits(['debt-saved'])
const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  expenseToEdit: {
    type: Object,
    default: null,
  },
  prefill: {
    type: Object,
    default: null,
  },
})
const categories = computed(() => props.categories)

const selectedCategory = ref('')
const price = ref(null)
const description = ref('')
const splitType = ref('equal')
const groupUsers = ref([])
const customSplits = ref({})
const payerId = ref('')
const route = useRoute()
const groupId = route.params.group_id
const debtDate = ref(format(new Date(), 'yyyy-MM-dd'))
const debtFormValidator = ref(null)

const isEditMode = computed(() => !!props.expenseToEdit)

const fields = [
  {
    selector: '#price',
    rules: [
      { rule: 'required', errorMessage: 'Il prezzo è obbligatorio' },
      {
        validator: (value) => isValidDecimal(value) && parseDecimal(value) > 0,
        errorMessage: 'Inserisci un importo valido (es. 12,50)',
      },
    ],
  },
  {
    selector: '#description',
    rules: [
      { rule: 'required', errorMessage: 'La descrizione è obbligatoria' },
    ],
  },
  {
    selector: '#category',
    rules: [{ rule: 'required', errorMessage: 'Seleziona una categoria' }],
  },
]

onMounted(async () => {
  initGroupData()

  if (props.prefill && !props.expenseToEdit) {
    const fmt = (n) => n.toFixed(2).replace('.', ',')
    splitType.value = 'custom'
    description.value = props.prefill.description || ''
    if (props.prefill.date) debtDate.value = props.prefill.date
    customSplits.value = Object.fromEntries(
      Object.entries(props.prefill.splits).map(([id, v]) => [id, fmt(v)]),
    )
    price.value = fmt(props.prefill.price)
  }

  if (isEditMode.value) {
    const expense = props.expenseToEdit
    price.value = expense.price
    description.value = expense.description
    selectedCategory.value = expense.category?.id || expense.category_id
    payerId.value = expense.user_id
    debtDate.value = format(new Date(expense.date), 'yyyy-MM-dd')

    if (expense.splits) {
      customSplits.value = expense.splits
      const values = Object.values(expense.splits)
      // Controlla se tutti i valori sono (quasi) uguali
      const allEqual = values.every((v) => Math.abs(v - values[0]) < 0.01)
      splitType.value = allEqual && values.length > 1 ? 'equal' : 'custom'
    }
  }
})

const initGroupData = () => {
  groupUsers.value = props.group.users || []
  if (groupUsers.value.length) {
    payerId.value = groupUsers.value[0].id
  }
  if (props.categories.length) {
    const preferred = props.categories.find(
      (c) => c.description?.trim().toLowerCase() === 'spesa',
    )
    selectedCategory.value = (preferred || props.categories[0]).id
  }
  customSplits.value = Object.fromEntries(
    groupUsers.value.map((u) => [u.id, 0]),
  )
}

const adjustCustomSplits = (changedUserId) => {
  const total = parseDecimal(price.value)
  if (Number.isNaN(total)) return
  let val = parseDecimal(customSplits.value[changedUserId])
  if (isNaN(val)) val = 0

  const otherUsers = groupUsers.value.filter((u) => u.id !== changedUserId)
  if (otherUsers.length === 0) return

  const remainder = total - val
  let distributed = 0
  otherUsers.forEach((u, index) => {
    if (index === otherUsers.length - 1) {
      customSplits.value[u.id] = parseFloat(
        (remainder - distributed).toFixed(2),
      )
    } else {
      const share = parseFloat((remainder / otherUsers.length).toFixed(2))
      customSplits.value[u.id] = share
      distributed += share
    }
  })
}

const buildParams = () => ({
  price: parseDecimal(price.value),
  description: description.value.trim(),
  categoryId: selectedCategory.value,
  payerId: payerId.value,
  splitType: splitType.value,
  splits: Object.fromEntries(
    Object.entries(customSplits.value).map(([id, v]) => {
      const n = parseDecimal(v)
      return [id, Number.isNaN(n) ? 0 : n]
    }),
  ),
  groupId: groupId,
  date: debtDate.value,
})

const saveDebts = async () => {
  if (isEditMode.value) {
    await updateDebt()
    return
  }

  const params = {
    ...buildParams(),
  }
  let resp = await callService('groupDebts.createGroupDebt', params)
  if (resp.success) {
    toast.success('Debito salvato')
    emit('debt-saved')
    if (debtFormValidator.value) {
      debtFormValidator.value.init()
    }
  } else {
    toast.error('Errore')
  }
}

const updateDebt = async () => {
  const params = {
    id: props.expenseToEdit.id,
    ...buildParams(),
  }
  let resp = await callService('groupDebts.updateGroupDebt', params)
  if (resp.success) {
    toast.success('Spesa aggiornata')
    emit('debt-saved')
  } else {
    toast.error(resp.message || "Errore durante l'aggiornamento")
  }
}

const onSuccess = () => {
  saveDebts()
}

const onFail = (fields) => {
  console.warn('Campi non validi', fields)
}

watch([price, splitType], () => {
  const total = parseDecimal(price.value)
  if (splitType.value === 'equal' && groupUsers.value.length && total > 0) {
    const perPerson = +(total / groupUsers.value.length).toFixed(2)
    customSplits.value = Object.fromEntries(
      groupUsers.value.map((u) => [u.id, perPerson]),
    )
  }
})
</script>

<style scoped lang="scss">
.form-card {
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
}

.date-input {
  border-radius: 999px;
  font-weight: 650;
}

.input-group-text {
  border-color: var(--app-border);
  border-radius: 0.75rem 0 0 0.75rem;
  background: color-mix(in srgb, var(--app-muted) 10%, var(--app-surface));
  color: var(--app-ink);
}

.save-btn {
  width: 100%;
  min-height: 3rem;
  font-size: 1rem;
}

@media (min-width: 576px) {
  .save-btn {
    width: auto;
    padding-inline: 3rem;
  }
}
</style>

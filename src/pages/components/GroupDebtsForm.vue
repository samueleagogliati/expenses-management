<template>
  <ValidatedForm
    form-id="debtForm"
    :fields="fields"
    @success="onSuccess"
    @fail="onFail"
  >
    <div class="container mt-3">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="card p-3 p-md-4 shadow border-0 rounded-3">
            <div class="card-body">
              <div class="row justify-content-center mb-4">
                <div class="col-12 col-sm-6">
                  <input
                    type="date"
                    class="form-control text-center bg-light border-0"
                    id="debtDate"
                    v-model="debtDate"
                  />
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
                    placeholder="€"
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
                    class="form-select no-outline"
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
                    v-model.number="customSplits[user.id]"
                  />
                </div>
              </div>

              <div class="text-center mt-4">
                <button
                  class="btn btn-dark w-100 w-sm-auto px-5 py-2 text-uppercase rounded-pill fw-bold shadow-sm"
                  type="submit"
                >
                  Salva
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import callService from '../../services/api'
import ValidatedForm from './ValidatedForm.vue'
import { toast } from 'vue3-toastify'

const emit = defineEmits(['debt-saved'])

const categories = ref([])
const selectedCategory = ref('')
const price = ref(null)
const description = ref('')
const splitType = ref('equal')
const groupUsers = ref([])
const customSplits = ref({})
const payerId = ref('')
const group = ref(null)
const route = useRoute()
const groupId = route.params.group_id
const debtDate = ref(new Date().toISOString().split('T')[0])

const fields = [
  {
    selector: '#price',
    rules: [
      { rule: 'required', errorMessage: 'Il prezzo è obbligatorio' },
      { rule: 'number', errorMessage: 'Inserisci un numero' },
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
  await loadCategories()
  await loadGroup()
  initGroupData()
})

const loadGroup = async () => {
  group.value = await callService('groups.getGroup', {
    group_id: groupId,
  })
}

const loadCategories = async () => {
  categories.value = await callService('categories.list', {})
  if (categories.value.length) {
    selectedCategory.value = categories.value[0].id
  }
}

const initGroupData = () => {
  groupUsers.value = group.value.users || []
  if (groupUsers.value.length) {
    payerId.value = groupUsers.value[0].id
  }
  customSplits.value = Object.fromEntries(
    groupUsers.value.map((u) => [u.id, 0]),
  )
}

const saveDebts = async () => {
  const params = {
    price: price.value,
    description: description.value,
    categoryId: selectedCategory.value,
    payerId: payerId.value,
    splitType: splitType.value,
    splits: customSplits.value,
    groupId: groupId,
    date: debtDate.value,
  }
  let resp = await callService('groupDebts.createGroupDebt', params)
  if (resp.success) {
    toast.success('Debito salvato')
    emit('debt-saved')
    price.value = null
    description.value = ''
    splitType.value = 'equal'

    debtDate.value = new Date().toISOString().split('T')[0]
  } else {
    toast.error('Errore')
  }
}

const onSuccess = () => {
  saveDebts()
}

const onFail = (fields) => {
  console.warn('Campi non validi', fields)
}

watch([price, splitType], () => {
  if (splitType.value === 'equal' && groupUsers.value.length && price.value) {
    const perPerson = +(price.value / groupUsers.value.length).toFixed(2)
    customSplits.value = Object.fromEntries(
      groupUsers.value.map((u) => [u.id, perPerson]),
    )
  }
})
</script>

<style scoped>
@media (min-width: 576px) {
  .w-sm-auto {
    width: auto !important;
  }
}
</style>

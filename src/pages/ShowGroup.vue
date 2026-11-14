<template>
  <div
    v-if="isLoading"
    class="group-loading d-flex align-items-center justify-content-center"
    role="status"
  >
    <span class="spinner-border spinner-border-sm text-primary" aria-hidden="true"></span>
    <span class="ms-2">Caricamento gruppo…</span>
  </div>

  <div v-else-if="group" class="container-fluid px-md-4 py-3 mb-5">
    <Notes :user="user" />
    <header class="group-head">
      <router-link to="/groups" class="group-back" aria-label="Torna ai gruppi">
        <i class="bi bi-chevron-left" aria-hidden="true"></i>
      </router-link>
      <h1 class="group-title text-break">{{ group?.name }}</h1>
    </header>
    <div class="scan-row">
      <ReceiptScanner :users="group.users || []" @apply="onReceiptApply" />
    </div>
    <GroupDebtsForm
      :key="formKey"
      :group="group"
      :prefill="receiptPrefill"
      :categories="categories"
      :expense-to-edit="expenseToEdit"
      @debt-saved="onDebtSaved"
      ref="debtForm"
    />

    <DebtsSummary
      v-if="group"
      :summary="group.debt_summary"
      :total="group.debt_total"
    />
    <div class="text-center my-4" v-if="groupDebts.length">
      <button
        class="btn btn-outline-custom rounded-pill px-4"
        @click="showDebtsTable = !showDebtsTable"
      >
        <i
          class="bi me-2"
          :class="showDebtsTable ? 'bi-eye-slash' : 'bi-eye'"
        ></i>
        {{ showDebtsTable ? 'Nascondi Dettaglio' : 'Mostra Dettaglio' }}
      </button>
    </div>
    <DebtsTable
      v-if="showDebtsTable && groupDebts.length"
      :group-debts="groupDebts"
      :group-id="groupId"
      @refresh-debts="loadGroup"
      @edit-debt="handleEditDebt"
    ></DebtsTable>
  </div>

  <div v-else class="container py-5 text-center" role="alert">
    <p class="text-muted mb-3">Non è stato possibile caricare il gruppo.</p>
    <button class="btn btn-outline-primary" @click="loadGroup">Riprova</button>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import callService from '../services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import Notes from './components/Notes.vue'
import GroupDebtsForm from './components/GroupDebtsForm.vue'
import DebtsSummary from './components/DebtsSummary.vue'
import DebtsTable from './components/DebtsTable.vue'
import ReceiptScanner from './components/ReceiptScanner.vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({ groups: [] }),
  },
})

const route = useRoute()
const groupId = computed(() => route.params.group_id)

const group = ref(null)
const categories = ref([])
const groupDebts = ref([])
const isLoading = ref(true)
const showDebtsTable = ref(true)
const expenseToEdit = ref(null)
const formKey = ref(0)
const receiptPrefill = ref(null)
const debtForm = ref(null)

onMounted(async () => {
  await loadGroup()
})

const loadGroup = async () => {
  const isInitialLoad = !group.value
  if (isInitialLoad) isLoading.value = true

  try {
    const [loadedGroup, loadedCategories] = await Promise.all([
      callService('groups.getGroup', { group_id: groupId.value }),
      categories.value.length
        ? Promise.resolve(categories.value)
        : callService('categories.list', {}),
    ])

    group.value = loadedGroup
    categories.value = loadedCategories
    groupDebts.value = loadedGroup.group_debts || []
  } catch (error) {
    console.error('Errore durante il caricamento del gruppo:', error)
    toast.error('Errore durante il caricamento del gruppo.')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => route.params.group_id,
  async () => {
    group.value = null
    categories.value = []
    groupDebts.value = []
    await loadGroup()
    formKey.value++
  },
)

const handleEditDebt = async (debt) => {
  let expenseForForm = {}
  try {
    const date = format(new Date(debt.date), 'yyyy-MM-dd')
    const groupUserIds = group.value.users.map((u) => u.id)
    let allRelevantExpenses = []

    for (const userId of groupUserIds) {
      const userExpenses = await callService('expenses.getListWithCategories', {
        userId: userId,
        startDate: date,
        endDate: date,
      })
      const matching = userExpenses.filter(
        (e) =>
          (e.description || '').trim().toLowerCase() ===
          (debt.description || '').trim().toLowerCase(),
      )
      allRelevantExpenses.push(...matching)
    }

    if (allRelevantExpenses.length === 0) {
      toast.error('Nessuna spesa corrispondente trovata per la modifica.')
      return
    }

    const totalPrice = allRelevantExpenses.reduce(
      (sum, e) => sum + parseFloat(e.price),
      0,
    )
    const splits = {}
    allRelevantExpenses.forEach((e) => {
      splits[e.user_id] = parseFloat(e.price)
    })

    const mainExpense = allRelevantExpenses.find(
      (e) => e.user_id === debt.receiver.id,
    )

    if (!mainExpense) {
      toast.error(
        'Impossibile trovare la spesa del pagante originale. Modifica non possibile.',
      )
      return
    }

    expenseForForm = {
      id: mainExpense.id,
      price: totalPrice,
      description: mainExpense.description,
      category: mainExpense.category,
      category_id: mainExpense.category?.id,
      user_id: debt.receiver.id,
      date: mainExpense.date,
      splits: splits,
    }
  } catch (e) {
    console.error('Error finding expense to edit', e)
    toast.error('Errore nel trovare la spesa da modificare.')
    return
  }

  expenseToEdit.value = expenseForForm
  formKey.value++
  nextTick(() => {
    debtForm.value?.$el.scrollIntoView({ behavior: 'smooth' })
  })
}

const onReceiptApply = (data) => {
  expenseToEdit.value = null
  receiptPrefill.value = data
  formKey.value++
  nextTick(() => {
    debtForm.value?.$el.scrollIntoView({ behavior: 'smooth' })
  })
}

const onDebtSaved = () => {
  expenseToEdit.value = null
  receiptPrefill.value = null
  formKey.value++
  loadGroup()
}
</script>

<style lang="scss" scoped>
.group-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 880px;
  margin: 0 auto 1.25rem;
  padding: 0 0.75rem;
}

.group-back {
  display: grid;
  flex: none;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: 50%;
  background: var(--app-surface);
  color: var(--app-ink);
  transition:
    border-color 140ms ease,
    color 140ms ease;

  &:hover {
    border-color: var(--app-primary);
    color: var(--app-primary);
  }
}

.scan-row {
  display: flex;
  justify-content: center;
  max-width: 880px;
  margin: 0 auto 0.5rem;
}

.group-title {
  margin: 0;
  font-size: clamp(1.4rem, 4vw, 1.9rem);
}

.group-loading {
  min-height: 16rem;
  color: var(--app-muted);
}

.btn-outline-custom {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-ink);
  font-weight: 650;
  transition:
    border-color 140ms ease,
    color 140ms ease;

  &:hover {
    border-color: var(--app-primary);
    color: var(--app-primary);
  }
}
</style>

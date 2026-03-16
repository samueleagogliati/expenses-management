<template>
  <div class="container-fluid px-md-4 py-3 mb-5">
    <div class="position-absolute top-0 start-0 p-3">
      <Notes :user="user" />
    </div>
    <h1 class="text-center mt-5 h3 text-break group-title">
      {{ group?.name?.toUpperCase() }}
    </h1>
    <GroupDebtsForm
      :key="formKey"
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
        class="btn btn-outline-custom w-100 w-sm-auto rounded-pill px-4"
        @click="showDebtsTable = !showDebtsTable"
      >
        <i
          class="fa-solid me-2"
          :class="showDebtsTable ? 'fa-eye-slash' : 'fa-eye'"
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
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import callService from '../services/api'
import { toast } from 'vue3-toastify'
import dayjs from 'dayjs'
import Notes from './components/Notes.vue'
import GroupDebtsForm from './components/GroupDebtsForm.vue'
import DebtsSummary from './components/DebtsSummary.vue'
import DebtsTable from './components/DebtsTable.vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({ groups: [] }),
  },
})

const route = useRoute()
const groupId = route.params.group_id

const group = ref(null)
const groupDebts = ref([])
const showDebtsTable = ref(true)
const expenseToEdit = ref(null)
const formKey = ref(0)
const debtForm = ref(null)

onMounted(async () => {
  await loadGroup()
})

const loadGroup = async () => {
  group.value = await callService('groups.getGroup', { group_id: groupId })
  groupDebts.value = group.value.group_debts || []
}

const handleEditDebt = async (debt) => {
  let expenseForForm = {}
  try {
    const date = dayjs(debt.date).format('YYYY-MM-DD')
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

const onDebtSaved = () => {
  expenseToEdit.value = null
  formKey.value++
  loadGroup()
}
</script>

<style lang="scss" scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #fcfcfc;
}

@media (min-width: 576px) {
  .w-sm-auto {
    width: auto !important;
  }
}

.group-title {
  font-weight: 800;
  letter-spacing: 2px;
  color: #333;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.btn-outline-custom {
  border: 2px solid #333;
  color: #333;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background-color: #333;
    color: #fff;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
}
</style>

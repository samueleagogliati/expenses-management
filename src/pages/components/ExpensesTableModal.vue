<template>
  <div class="table-responsive">
    <table class="table table-bordered table-hover">
      <thead>
        <tr>
          <th class="bg-light">Categoria</th>
          <th class="bg-light">Descrizione</th>
          <th class="bg-light">Prezzo</th>
          <th class="bg-light"></th>
          <th class="bg-light"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(expense, index) in expenses" :key="index">
          <td class="align-middle">
            <input
              v-if="expense.editMode"
              v-model="expense.category"
              class="form-control"
            />
            <span v-else>{{ expense.category }}</span>
          </td>
          <td class="align-middle">
            <input
              v-if="expense.editMode"
              v-model="expense.description"
              class="form-control"
            />
            <span v-else>{{ expense.description }}</span>
          </td>
          <td class="align-middle">
            <input
              v-if="expense.editMode"
              v-model="expense.price"
              class="form-control"
            />
            <span v-else>{{ formatPrice(expense.price) }}</span>
          </td>
          <td class="align-middle">
            <button
              class="btn"
              @click="deleteExpense(expense.id)"
              type="button"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
          <td class="align-middle">
            <button class="btn" @click="editedExpense(expense)" type="button">
              <i v-if="!expense.editMode" class="fa-solid fa-pencil"></i>
              <i v-else class="fa-solid fa-check"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
import callService from '../../services/api'
export default {
  props: {
    expenses: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    formatPrice(value) {
      return value + ' €'
    },
    async deleteExpense(expenseId) {
      if (confirm('Sei sicuro di voler eliminare questa spesa?')) {
        try {
          let resp = await callService('expenses.deleteExpense', {
            id: expenseId,
          })
          if (resp.status === 200) {
            this.$emit('reloadExpenses')
          } else {
            alert(resp.message)
          }
        } catch (error) {
          alert("Si è verificato un errore durante l'eliminazione della spesa")
          console.error("Errore durante l'eliminazione dell'expense:", error)
        }
      }
    },
    editedExpense(expense) {
      expense.editMode = !expense.editMode
      if (!expense.editMode) {
        this.$emit('editedExpense', expense)
      }
    },
  },
}
</script>

<style scoped></style>

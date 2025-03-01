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
            <div class="control-wrapper" v-if="expense.editMode">
              <select
                class="form-select"
                @change="selectOption(expense, $event)"
                v-model="expense.category.id"
              >
                <option value="">Seleziona la categoria</option>
                <option
                  v-for="category in categories"
                  :value="category.id"
                  :key="category.id"
                >
                  {{ category.description }}
                </option>
              </select>
            </div>
            <span v-else>{{ expense.category.description }}</span>
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
import callService from '../../services/api'
export default {
  data() {
    return {
      selectedCategory: null,
    }
  },
  props: {
    expenses: {
      type: Array,
      default: () => [],
    },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    selectOption(expense, event) {
      const selectedCategoryId = event.target.value
      const selectedCategory = this.categories.find(
        (cat) => cat.id == selectedCategoryId,
      )
      if (selectedCategory) {
        expense.category = { ...selectedCategory }
      }
    },
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
        expense.category_id = expense.category.id
        this.$emit('editedExpense', expense)
      }
    },
  },
}
</script>

<style scoped></style>

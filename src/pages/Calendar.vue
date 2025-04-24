<template>
  <div class="mt-6 container calendar w-100" v-if="user">
    <div class="header">
      <button @click="goToPreviousMonth" class="fs-1 ms-2 calendar-button">
        &lt;
      </button>
      <h2 class="month">{{ currentMonth }}</h2>
      <button @click="goToNextMonth" class="fs-1 me-2 calendar-button">
        &gt;
      </button>
    </div>

    <div class="w-100 d-flex justify-content-center">
      <div class="result text-center my-3 py-2 bg-black text-white w-50 d">
        Spese totali del mese: {{ total }} €
      </div>
    </div>

    <div class="days mt-1">
      <div
        v-for="(day, index) in days"
        :key="index"
        class="day text-center position-relative"
      >
        <button
          class="w-100 calendar-button"
          @click="openModal(day)"
          data-bs-toggle="modal"
          data-bs-target="#dayModal"
        >
          {{ day }}
        </button>
        <div class="total-of-day text-center">
          <span style="padding: 2px" v-if="totalOfDays && totalOfDays[day - 1]"
            >{{ formatNumber(totalOfDays[day - 1]) }}
          </span>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      id="dayModal"
      tabindex="-1"
      aria-labelledby="dayModal"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <form id="form-expenses">
          <div class="modal-content">
            <div class="modal-header bg-light">
              <h5
                class="modal-title h-100 w-100 align-content-center text-center"
                style="font-weight: bold"
              >
                {{ selectedDay }}
              </h5>
              <button
                type="button"
                class="btn-close text-center align-content-center"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="container">
                <ExpensesTableModal
                  @reloadExpenses="loadExpenses"
                  :expenses="expenses"
                  class="mb-3"
                  v-if="expenses.length > 0"
                  @editedExpense="editExpense"
                  :categories="categories"
                ></ExpensesTableModal>

                <a
                  href="#category"
                  type="button"
                  @click="toggleSelect"
                  class="btn btn-dark"
                  v-show="!showSelect"
                >
                  <i class="fa-solid fa-plus"></i>
                </a>
                <a
                  href="#category"
                  type="button"
                  @click="toggleSelect"
                  class="btn btn-danger mb-2"
                  v-show="showSelect"
                >
                  <i class="fa-solid fa-minus"></i>
                </a>
                <br />

                <div class="control-wrapper">
                  <select
                    v-if="showSelect"
                    class="form-select"
                    id="category"
                    @change="selectOption"
                    v-model="selectedCategory"
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

                <div class="input-group mb-3 mt-3" v-if="showSelect">
                  <span class="input-group-text" style="width: 20%"
                    >Prezzo</span
                  >
                  <input
                    autocomplete="off"
                    id="price"
                    type="text"
                    class="form-control"
                    style="width: 15%"
                  />
                  <input
                    autocomplete="off"
                    id="description"
                    type="text"
                    class="form-control"
                    style="width: 65%"
                    placeholder="Descrizione spesa"
                  />
                </div>
              </div>

              <AlertMessage
                v-if="showAlertMessage"
                :message="message"
                :type="typeMessage"
                class="mt-3"
              ></AlertMessage>
            </div>
            <div class="modal-footer bg-light">
              <button
                type="button"
                class="btn btn-primary"
                data-bs-dismiss="modal"
                @click="resetModal"
              >
                Chiudi
              </button>
              <button
                type="submit"
                class="btn btn-dark"
                v-if="!disabledSaveButton"
              >
                Salva
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import JustValidate from 'just-validate'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { it } from 'date-fns/locale'
import $ from 'jquery'
import ExpensesTableModal from './components/ExpensesTableModal.vue'
import AlertMessage from './components/AlertMessage.vue'
import { jwtDecode } from 'jwt-decode'
import callService from '../services/api'
import moment from 'moment'

export default {
  name: 'Calendar',
  components: {
    ExpensesTableModal,
    AlertMessage,
  },
  data() {
    return {
      items: [],
      total: 0,
      selectedDate: null,
      currentDate: moment().startOf('day').toDate(),
      selectedDay: null,
      showSelect: false,
      expenses: [],
      categories: [],
      totalOfDays: [],
      typeMessage: null,
      message: null,
      showAlertMessage: false,
      user: null,
      editedExpenses: [],
      validation: null,
      isSaving: false,
      disabledSaveButton: true,
      selectedCategory: null,
    }
  },
  computed: {
    currentMonth() {
      const monthName = format(this.currentDate, 'MMMM', { locale: it })
      const capitalizedMonthName =
        monthName.charAt(0).toUpperCase() + monthName.slice(1)
      return `${capitalizedMonthName} ${format(this.currentDate, 'yyyy', { locale: it })}`
    },
    days() {
      const startDate = moment(this.currentDate).startOf('month').toDate()
      const endDate = moment(this.currentDate).endOf('month').toDate()
      const allDaysOfMonth = eachDayOfInterval({
        start: startDate,
        end: endDate,
      })
      return allDaysOfMonth.map((day) => format(day, 'd', { locale: it }))
    },
  },
  methods: {
    formatNumber(value) {
      const number = parseFloat(value.total)
      if (!number) return '-'
      return number % 1 === 0 ? `${parseInt(number)}€` : `${number.toFixed(2)}€`
    },
    resetModal() {
      if (this.validation) this.validation.destroy()
    },
    async loadDataForDays() {
      const startDate = moment(this.currentDate)
        .startOf('month')
        .format('YYYY-MM-DD')
      const endDate = moment(this.currentDate)
        .endOf('month')
        .format('YYYY-MM-DD')
      const results = await callService('expenses.getTotalOfDays', {
        userId: this.user.id,
        startDate,
        endDate,
      })

      const daysInMonth = moment(this.currentDate).daysInMonth()
      this.totalOfDays = Array.from({ length: daysInMonth }, (_, i) => {
        const result = results.find((r) => moment(r.date).date() === i + 1)
        return { day: i + 1, total: result ? result.total : 0 }
      })
    },
    async loadTotal() {
      const startDate = moment(this.currentDate)
        .startOf('month')
        .format('YYYY-MM-DD')
      const endDate = moment(this.currentDate)
        .endOf('month')
        .format('YYYY-MM-DD')
      try {
        this.total = await callService('expenses.getTotalOfPeriod', {
          userId: this.user.id,
          startDate,
          endDate,
        })
      } catch (error) {
        console.error('Errore durante il caricamento del totale:', error)
        this.total = 0
      }
    },
    goToPreviousMonth() {
      this.currentDate = moment(this.currentDate).subtract(1, 'month').toDate()
    },
    goToNextMonth() {
      this.currentDate = moment(this.currentDate).add(1, 'month').toDate()
    },
    async editExpense(expense) {
      await callService('expenses.updateExpense', {
        id: expense.id,
        category_id: expense.category_id,
        description: expense.description,
        price: expense.price,
      })
      await this.loadExpenses()
    },
    async openModal(day) {
      $('#category').val('')
      $('#description').val('')
      $('#price').val('')
      this.showSelect = false
      this.selectedDate = moment(this.currentDate)
        .date(day)
        .startOf('day')
        .toDate()
      this.selectedDay = 'Dettaglio ' + format(this.selectedDate, 'dd/MM/yyyy')
      await this.loadExpenses()
    },
    toggleSelect() {
      this.showSelect = !this.showSelect
      this.$nextTick(() => {
        this.loadValidation()
      })
    },
    async loadExpenses() {
      const resp = await callService('expenses.getListWithCategories', {
        userId: this.user.id,
        startDate: moment(this.selectedDate).format('YYYY-MM-DD'),
        endDate: moment(this.selectedDate).format('YYYY-MM-DD'),
      })

      this.expenses = resp.map((item) => ({
        id: item?.id,
        category: item.category,
        description: item?.description,
        price: item?.price,
      }))
    },
    async loadCategories() {
      this.categories = await callService('categories.list', {})
    },
    async saveExpense() {
      const response = await callService('expenses.createExpense', {
        category_id: this.selectedCategory,
        description: $('#description').val(),
        price: $('#price').val(),
        date: moment(this.selectedDate).format('YYYY-MM-DD'),
        user_id: this.user.id,
      })

      if (response.status === 200) {
        this.showSelect = false
        await this.loadExpenses()
        setTimeout(() => (this.showAlertMessage = false), 2000)
      }
    },
    async getUser() {
      const token = localStorage.getItem('token')
      const decodedToken = jwtDecode(token)
      return await callService('users.getUser', { id: decodedToken.id })
    },
    loadValidation() {
      if (this.validation) this.validation.destroy()
      if (this.showSelect) {
        this.validation = new JustValidate('#form-expenses', {
          errorFieldCssClass: 'is-invalid',
          successFieldCssClass: 'is-valid',
        })
          .onFail(() => {
            this.errorMessage = 'Controllare i campi inseriti'
          })
          .onSuccess(async () => {
            await this.saveExpense()
          })
          .addField('#category', [
            {
              rule: 'required',
              errorMessage: 'Il campo categoria è obbligatorio',
            },
          ])
          .addField('#price', [
            {
              rule: 'required',
              errorMessage: 'Il campo prezzo è obbligatorio',
            },
            {
              rule: 'number',
              errorMessage: 'Il campo prezzo deve essere un numero',
            },
          ])
          .addField('#description', [
            {
              rule: 'required',
              errorMessage: 'Il campo descrizione è obbligatorio',
            },
          ])
      }
    },
  },
  watch: {
    async currentMonth() {
      if (this.user) {
        await this.loadDataForDays()
        await this.loadTotal()
      }
    },
    async expenses() {
      if (this.user) {
        await this.loadDataForDays()
        await this.loadTotal()
      }
    },
    showSelect(oldValue, newValue) {
      this.disabledSaveButton = !this.disabledSaveButton
    },
  },
  async mounted() {
    this.user = await this.getUser()
    if (this.user) {
      await this.loadCategories()
      await this.loadDataForDays()
      await this.loadTotal()
    }
  },
}
</script>

<style scoped>
.result {
  font-family: 'Courier New', Courier, monospace;
}

.calendar-button {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  border: none;
  background: none;
  height: 80%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 62vh;
}

.day {
  padding: 8px;
  border: 1px solid #ccc;
}
.day:hover {
  background-color: #cccccc84;
}

.total-of-day {
  font-size: 15px;
  font-family: 'Courier New', Courier, monospace;
}

.form-select:focus {
  outline: none;
  box-shadow: none;
}

.form-control:focus {
  outline: none;
  box-shadow: none;
}
</style>

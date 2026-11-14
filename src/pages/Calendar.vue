<template>
  <div class="mt-6 container calendar w-100" v-if="user">
    <div class="header">
      <button
        @click="goToPreviousMonth"
        class="nav-arrow"
        aria-label="Mese precedente"
      >
        <i class="bi bi-chevron-left" aria-hidden="true"></i>
      </button>
      <h2 class="month">{{ currentMonth }}</h2>
      <button
        @click="goToNextMonth"
        class="nav-arrow"
        aria-label="Mese successivo"
      >
        <i class="bi bi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>

    <div class="w-100 d-flex justify-content-center">
      <div
        class="result text-center my-4 py-3 text-white w-auto px-5 rounded-pill shadow-sm total-badge"
      >
        <span class="small opacity-75 d-block">TOTALE MESE</span>
        {{ formatEuro(total) }}
      </div>
    </div>

    <div class="weekdays" aria-hidden="true">
      <div v-for="weekday in weekdays" :key="weekday">{{ weekday }}</div>
    </div>

    <div class="days mt-1">
      <div
        v-for="(day, index) in days"
        :key="day || `empty-${index}`"
        class="day text-center position-relative"
      >
        <div class="day-wrapper" :class="{ today: isToday(day) }">
          <template v-if="day">
            <button
              class="w-100 calendar-button"
              @click="openModal(day)"
              :aria-label="`Apri le spese del ${day}`"
            >
              {{ day }}
            </button>
            <div class="total-of-day text-center">
              <span v-if="totalOfDays?.[day - 1]?.total">
                {{ formatNumber(totalOfDays[day - 1]) }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      id="dayModal"
      ref="dayModal"
      tabindex="-1"
      aria-labelledby="dayModal"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <form id="form-expenses">
          <div class="modal-content">
            <div class="modal-header">
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

                <button
                  type="button"
                  @click="toggleSelect"
                  class="btn btn-primary"
                  v-show="!showSelect"
                >
                  <i class="bi bi-plus-lg"></i>
                </button>
                <button
                  type="button"
                  @click="toggleSelect"
                  class="btn btn-danger mb-2"
                  v-show="showSelect"
                >
                  <i class="bi bi-dash-lg"></i>
                </button>
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

                <div class="row g-2 mb-3 mt-3" v-if="showSelect">
                  <div class="col-12 col-sm-2">
                    <label class="form-label" for="price">Prezzo</label>
                  </div>
                  <div class="col-4 col-sm-3">
                    <input
                      autocomplete="off"
                      id="price"
                      type="text"
                      inputmode="decimal"
                      placeholder="0,00"
                      v-model="newExpensePrice"
                      class="form-control"
                    />
                  </div>
                  <div class="col-8 col-sm-7">
                    <input
                      autocomplete="off"
                      id="description"
                      type="text"
                      class="form-control"
                      v-model="newExpenseDescription"
                      placeholder="Descrizione spesa"
                    />
                  </div>
                </div>
              </div>

              <AlertMessage
                v-if="showAlertMessage"
                :message="message"
                :type="typeMessage"
                class="mt-3"
              ></AlertMessage>
            </div>
            <div class="modal-footer">
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
                class="btn btn-primary"
                v-if="showSelect"
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
import Modal from 'bootstrap/js/dist/modal'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDate,
  getDaysInMonth,
  isSameDay,
  parseISO,
  setDate,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { it } from 'date-fns/locale'
import ExpensesTableModal from './components/ExpensesTableModal.vue'
import AlertMessage from './components/AlertMessage.vue'
import callService from '../services/api'
import { toast } from 'vue3-toastify'
import { formatEuro, isValidDecimal, parseDecimal } from '../utils/number'

export default {
  name: 'Calendar',
  components: {
    ExpensesTableModal,
    AlertMessage,
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      items: [],
      total: 0,
      selectedDate: null,
      currentDate: startOfDay(new Date()),
      selectedDay: null,
      showSelect: false,
      expenses: [],
      categories: [],
      totalOfDays: [],
      typeMessage: null,
      message: null,
      showAlertMessage: false,
      editedExpenses: [],
      validation: null,
      isSaving: false,
      loadToken: 0,
      selectedCategory: null,
      newExpensePrice: '',
      newExpenseDescription: '',
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
      const startDate = startOfMonth(this.currentDate)
      const endDate = endOfMonth(this.currentDate)
      const allDaysOfMonth = eachDayOfInterval({
        start: startDate,
        end: endDate,
      })
      const mondayFirstOffset = (startDate.getDay() + 6) % 7
      return [
        ...Array(mondayFirstOffset).fill(null),
        ...allDaysOfMonth.map((day) => format(day, 'd', { locale: it })),
      ]
    },
    weekdays() {
      return ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
    },
  },
  methods: {
    isToday(day) {
      if (!day) return false
      const dayInCalendar = setDate(this.currentDate, Number(day))
      return isSameDay(new Date(), dayInCalendar)
    },
    formatEuro,
    formatNumber(value) {
      const number = parseFloat(value.total)
      if (!number) return '-'
      const text =
        number % 1 === 0 ? String(number) : number.toFixed(2).replace('.', ',')
      return `${text}€`
    },
    async refreshTotals() {
      if (!this.user) return
      const token = ++this.loadToken
      try {
        const [days, total] = await Promise.all([
          this.fetchDays(),
          this.fetchTotal(),
        ])
        // ignora risposte superate da un cambio mese più recente
        if (token !== this.loadToken) return
        this.totalOfDays = days
        this.total = total
      } catch (error) {
        console.error('Errore durante il caricamento del calendario:', error)
      }
    },
    resetModal() {
      if (this.validation) this.validation.destroy()
    },
    async fetchDays() {
      const startDate = format(startOfMonth(this.currentDate), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(this.currentDate), 'yyyy-MM-dd')
      const results = await callService('expenses.getTotalOfDays', {
        userId: this.user.id,
        startDate,
        endDate,
      })

      const byDay = new Map(
        results.map((r) => [getDate(parseISO(r.date)), r.total]),
      )
      return Array.from({ length: getDaysInMonth(this.currentDate) }, (_, i) => ({
        day: i + 1,
        total: byDay.get(i + 1) || 0,
      }))
    },
    async fetchTotal() {
      const startDate = format(startOfMonth(this.currentDate), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(this.currentDate), 'yyyy-MM-dd')
      return (
        (await callService('expenses.getTotalOfPeriod', {
          userId: this.user.id,
          startDate,
          endDate,
        })) || 0
      )
    },
    goToPreviousMonth() {
      this.currentDate = subMonths(this.currentDate, 1)
    },
    goToNextMonth() {
      this.currentDate = addMonths(this.currentDate, 1)
    },
    async editExpense(expense) {
      const price = parseDecimal(expense.price)
      if (Number.isNaN(price) || price < 0) {
        toast.error('Prezzo non valido')
        await this.loadExpenses()
        return
      }
      const resp = await callService('expenses.updateExpense', {
        id: expense.id,
        category_id: expense.category_id,
        description: expense.description,
        price,
      })
      if (resp?.status !== 200) toast.error(resp?.message || 'Errore')
      await this.loadExpenses()
    },
    async openModal(day) {
      this.showSelect = false
      this.selectedCategory = ''
      this.newExpenseDescription = ''
      this.newExpensePrice = ''
      this.selectedDate = setDate(this.currentDate, Number(day))
      this.selectedDay = 'Dettaglio ' + format(this.selectedDate, 'dd/MM/yyyy')
      await this.$nextTick()
      Modal.getOrCreateInstance(this.$refs.dayModal).show()
      await this.loadExpenses(false)
    },
    toggleSelect() {
      this.showSelect = !this.showSelect
      this.$nextTick(() => {
        this.loadValidation()
      })
    },
    async loadExpenses(refresh = true) {
      if (!this.selectedDate) return
      const resp = await callService('expenses.getListWithCategories', {
        userId: this.user.id,
        startDate: format(this.selectedDate, 'yyyy-MM-dd'),
        endDate: format(this.selectedDate, 'yyyy-MM-dd'),
      })

      this.expenses = resp.map((item) => ({
        id: item?.id,
        category: item.category,
        description: item?.description,
        price: item?.price,
      }))
      if (refresh !== false) this.refreshTotals()
    },
    async loadCategories() {
      this.categories = await callService('categories.list', {})
    },
    async saveExpense() {
      if (this.isSaving) return
      this.isSaving = true
      try {
        const response = await callService('expenses.createExpense', {
          category_id: this.selectedCategory,
          description: this.newExpenseDescription.trim(),
          price: parseDecimal(this.newExpensePrice),
          date: format(this.selectedDate, 'yyyy-MM-dd'),
          user_id: this.user.id,
        })

        if (response.status === 200) {
          this.showSelect = false
          this.selectedCategory = ''
          this.newExpenseDescription = ''
          this.newExpensePrice = ''
          if (this.validation) this.validation.destroy()
          await this.loadExpenses()
        } else {
          toast.error(response.message || 'Errore durante il salvataggio')
        }
      } catch (error) {
        console.error(error)
        toast.error('Errore durante il salvataggio')
      } finally {
        this.isSaving = false
      }
    },
    loadValidation() {
      if (this.validation) this.validation.destroy()
      if (this.showSelect) {
        this.validation = new JustValidate('#form-expenses', {
          errorFieldCssClass: 'is-invalid',
          successFieldCssClass: 'is-valid',
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
              validator: (value) => isValidDecimal(value) && parseDecimal(value) >= 0,
              errorMessage: 'Inserisci un importo valido (es. 12,50)',
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
    user: {
      immediate: true,
      async handler(user) {
        if (!user) return
        try {
          await this.loadCategories()
        } catch (error) {
          console.error('Errore durante il caricamento delle categorie:', error)
        }
        await this.refreshTotals()
      },
    },
    currentDate() {
      this.refreshTotals()
    },
  },
}
</script>

<style scoped>
.total-badge {
  background: linear-gradient(135deg, #5146e5 0%, #7770f2 100%);
  font-weight: 750;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 10px 24px rgba(81, 70, 229, 0.18) !important;
}

.nav-arrow {
  display: grid;
  width: 2.6rem;
  height: 2.6rem;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: 50%;
  background: var(--app-surface);
  color: var(--app-ink);
  transition:
    transform 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.nav-arrow:hover {
  border-color: var(--app-primary);
  color: var(--app-primary);
  transform: scale(1.06);
}

.calendar-button {
  font-weight: 650;
  color: #354159;
  border: none;
  background: none;
  min-height: 2.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 860px;
  margin: 0 auto;
}

.month {
  margin: 0;
  text-align: center;
  font-size: clamp(1.25rem, 4vw, 1.8rem);
}

.weekdays,
.days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: clamp(0.2rem, 1vw, 0.55rem);
  width: min(100%, 1040px);
  margin-right: auto;
  margin-left: auto;
  padding: 0 clamp(0.15rem, 1vw, 0.65rem);
}

.weekdays {
  margin-top: 1rem;
  color: var(--app-muted);
  font-size: 0.76rem;
  font-weight: 750;
  text-align: center;
  text-transform: uppercase;
}

.day-wrapper:hover {
  background-color: #f2f1ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(35, 37, 65, 0.06);
  border-color: #c9c5ff;
}

.total-of-day {
  font-size: 0.85rem;
  font-weight: 700;
  color: #5146e5;
  margin-top: 0.2rem;
  font-variant-numeric: tabular-nums;
  font-size: clamp(0.62rem, 1.6vw, 0.85rem);
}

.day {
  min-width: 0;
  padding: 0;
}

.day-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: clamp(3.65rem, 9vw, 6.5rem);
  height: 100%;
  border: 1px solid var(--app-border);
  border-radius: clamp(0.55rem, 1vw, 0.85rem);
  background: var(--app-surface);
  transition:
    transform 140ms ease,
    box-shadow 140ms ease,
    border-color 140ms ease;
}

.today {
  background-color: #f0efff;
  border-color: #5146e5;
  box-shadow: 0 0 0 1px #5146e5 inset;
}

.day-wrapper.today .calendar-button {
  color: #5146e5;
}

@media (max-width: 575.98px) {
  .calendar {
    padding-right: 0.7rem;
    padding-left: 0.7rem;
  }

  .days,
  .weekdays {
    gap: 0.18rem;
    padding-right: 0;
    padding-left: 0;
  }

  .weekdays {
    margin-top: 0.5rem;
    font-size: 0.63rem;
  }

  .day-wrapper {
    min-height: 3.7rem;
    border-radius: 0.55rem;
  }

  .calendar-button {
    font-size: 0.9rem;
  }

  .total-badge {
    padding-right: 1.25rem !important;
    padding-left: 1.25rem !important;
    font-size: 1rem;
  }
}
</style>

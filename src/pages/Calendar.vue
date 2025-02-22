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
          <span
            style="padding: 1px"
            v-if="total_of_days && total_of_days[day - 1]"
            >({{ total_of_days[day - 1].total || 0 }}€)</span
          >
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
import JustValidate from "just-validate"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { it } from "date-fns/locale"
import $ from "jquery"
import axios from "axios"
import ExpensesTableModal from "./components/ExpensesTableModal.vue"
import AlertMessage from "./components/AlertMessage.vue"
import { jwtDecode } from "jwt-decode"

export default {
  name: "Calendar",
  components: {
    ExpensesTableModal,
    AlertMessage,
  },
  data() {
    return {
      items: [{ title: "ciao" }],
      total: 0,
      selectedDate: null,
      currentDate: new Date(),
      selectedDay: null,
      showSelect: false,
      expenses: [],
      categories: [],
      total_of_days: [],
      typeMessage: null,
      message: null,
      showAlertMessage: false,
      user: null,
      editedExpenses: [],
      validation: null,
      isSaving: false,
      disabledSaveButton: true,
    }
  },
  props: {},
  computed: {
    currentMonth() {
      const monthName = format(this.currentDate, "MMMM", { locale: it })
      const capitalizedMonthName =
        monthName.charAt(0).toUpperCase() + monthName.slice(1)
      return (
        capitalizedMonthName +
        " " +
        format(this.currentDate, "yyyy", { locale: it })
      )
    },
    days() {
      const startDate = startOfMonth(this.currentDate)
      const endDate = endOfMonth(this.currentDate)
      const allDaysOfMonth = eachDayOfInterval({
        start: startDate,
        end: endDate,
      })
      return allDaysOfMonth.map((day) => format(day, "d", { locale: it }))
    },
  },
  methods: {
    resetModal() {
      if (this.validation != null) this.validation.destroy()
    },
    async loadDataForDays() {
      let date = new Date(this.currentDate)
      let month = date.getMonth()
      let year = date.getFullYear()
      let total_of_days = await axios.post(
        "http://localhost:5001/expenses_of_days",
        { year: year, month: month, userId: this.user.id },
      )
      this.total_of_days = total_of_days.data
    },
    async loadTotal() {
      let date = new Date(this.currentDate)
      let month = date.getMonth()
      let year = date.getFullYear()
      let userId = this.user.id
      try {
        let response = await axios.post("http://localhost:5001/expenses", {
          year,
          month,
          userId,
        })
        if (response && response.data) {
          this.total = response.data
        } else {
          this.total = 0
        }
      } catch (error) {
        console.error("Errore durante il caricamento del totale:", error)
        this.total = 0
      }
    },
    goToPreviousMonth() {
      const previousMonth = new Date(this.currentDate)
      previousMonth.setMonth(previousMonth.getMonth() - 1)
      this.currentDate = previousMonth
    },
    goToNextMonth() {
      const nextMonth = new Date(this.currentDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      this.currentDate = nextMonth
    },
    async editExpense(expense) {
      let resp = await axios.put(
        "http://localhost:5001/expenses/" + expense.id,
        {
          category_id: expense.category_id,
          description: expense.description,
          price: expense.price,
        },
      )
      await this.loadExpenses()
    },
    async openModal(day) {
      $("#category").val("")
      $("#description").val("")
      $("#price").val("")
      this.showSelect = false
      const currentMonth = this.currentDate.getMonth()
      const currentYear = this.currentDate.getFullYear()
      this.selectedDate = new Date(currentYear, currentMonth, day)
      this.selectedDay = "Dettaglio " + format(this.selectedDate, "dd/MM/yyyy")
      await this.loadExpenses()
      await this.loadCategories()
    },
    toggleSelect() {
      this.showSelect = !this.showSelect
      this.$nextTick(() => {
        this.loadValidation()
      })
    },
    async loadExpenses() {
      let resp = await axios.post("http://localhost:5001/expenses_of_day", {
        selectedDate: this.selectedDate,
        userId: this.user.id,
      })
      this.expenses = resp.data.map((item) => ({
        id: item?.id,
        category: item.category?.description,
        description: item?.description,
        price: item?.price,
      }))
    },
    async loadCategories() {
      let resp = await axios.get("http://localhost:5001/categories")
      this.categories = resp.data
    },
    async saveExpense() {
      let category_id = $("#category").prop("selectedIndex")
      let description = $("#description").val()
      let price = $("#price").val()
      let response = await axios.post("http://localhost:5001/saveExpense", {
        category_id: category_id,
        description: description,
        price: price,
        date: this.selectedDate,
        user_id: this.user.id,
      })
      if (response.status === 200) {
        this.showAlertMessage = true
        this.message = "Spesa inserita"
        this.typeMessage = "success"
        this.showSelect = false
        await this.loadExpenses()
        setTimeout(() => {
          this.showAlertMessage = false
        }, 2000)
      }
    },
    async getUser() {
      const token = localStorage.getItem("token")
      const decodedToken = jwtDecode(token)
      let resp = await axios.get(
        "http://localhost:5001/users/" + decodedToken.id,
      )
      return resp.data
    },
    loadValidation() {
      if (this.validation != null) {
        this.validation.destroy()
      }
      if (this.showSelect) {
        let validator = new JustValidate("#form-expenses", {
          errorFieldCssClass: "is-invalid",
          successFieldCssClass: "is-valid",
        })
        validator
          .onFail((fields) => {
            this.errorMessage = "Controllare i campi inseriti"
          })
          .onSuccess(async (fields, event) => {
            await this.saveExpense()
          })
          .addField("#category", [
            {
              rule: "required",
              errorMessage: "Il campo categoria è obbligatorio",
            },
          ])
          .addField("#price", [
            {
              rule: "required",
              errorMessage: "Il campo prezzo è obbligatorio",
            },
            {
              rule: "number",
              errorMessage: "Il campo prezzo deve essere un numero",
            },
          ])
          .addField("#description", [
            {
              rule: "required",
              errorMessage: "Il campo descrizione è obbligatorio",
            },
          ])
        this.validation = validator
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
    disabledSaveButton(oldValue, newValue) {},
  },
  async mounted() {
    this.user = await this.getUser()
    if (this.user) {
      await this.loadDataForDays()
      await this.loadTotal()
    }
  },
}
</script>

<style scoped>
/* .month
{
  font-family: Verdana, Geneva, Tahoma, sans-serif;
} */

.result {
  font-family: "Courier New", Courier, monospace;
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
  font-size: 12px;
  font-family: "Courier New", Courier, monospace;
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

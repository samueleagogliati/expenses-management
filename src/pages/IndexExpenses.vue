<template>
  <div class="" v-if="user">
    <div class="form-check form-switch ms-3 mb-2">
      <label class="form-check-label" for="show-filters" v-if="!showFilters"
        >Mostra filtri</label
      >
      <label class="form-check-label" for="show-filters" v-else
        >Nascondi filtri</label
      >
      <input
        class="form-check-input"
        type="checkbox"
        id="show-filters"
        @change="showHideFilters"
      />
    </div>

    <div class="row ms-2 mb-2 d-flex align-items-end" v-if="showFilters">
      <div class="col-md-2">
        <div class="form-group">
          <label for="monthSelect">Mese</label>
          <select class="form-control" id="monthSelect">
            <option value="1">Gennaio</option>
            <option value="2">Febbraio</option>
            <option value="3">Marzo</option>
            <option value="4">Aprile</option>
            <option value="5">Maggio</option>
            <option value="6">Giugno</option>
            <option value="7">Luglio</option>
            <option value="8">Agosto</option>
            <option value="9">Settembre</option>
            <option value="10">Ottobre</option>
            <option value="11">Novembre</option>
            <option value="12">Dicembre</option>
          </select>
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label for="yearSelect">Anno</label>
          <select class="form-control" id="yearSelect">
            <!-- Opzioni dell'anno -->
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
            <option value="2031">2031</option>
            <option value="2032">2032</option>
            <option value="2033">2033</option>
            <option value="2034">2034</option>
            <option value="2035">2035</option>
            <option value="2036">2036</option>
            <option value="2037">2037</option>
            <option value="2038">2038</option>
            <option value="2039">2039</option>
            <option value="2040">2040</option>
            <option value="2041">2041</option>
            <option value="2042">2042</option>
            <option value="2043">2043</option>
            <option value="2044">2044</option>
            <option value="2045">2045</option>
            <option value="2046">2046</option>
            <option value="2047">2047</option>
            <option value="2048">2048</option>
            <option value="2049">2049</option>
            <option value="2050">2050</option>
          </select>
        </div>
      </div>
      <div class="col-md-2">
        <button class="btn btn-secondary ps-3 pe-3" @click="searchWithFilters">
          Cerca
        </button>
      </div>
    </div>

    <ExpensesTableVue
      v-if="expenses && expenses.length > 0"
      :expenses="expenses"
      :categories="categories"
    >
    </ExpensesTableVue>
  </div>
</template>

<script>
import ExpensesTableVue from "./components/ExpensesTable.vue"
import axios from "axios"
import { format } from "date-fns"

export default {
  components: {
    ExpensesTableVue,
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      expenses: null,
      categories: null,
      noData: false,
      filters: {
        month: null,
        year: null,
      },
      showFilters: false,
    }
  },
  watch: {
    async user(oldValue, newValue) {
      await this.loadData()
    },
  },
  methods: {
    async loadData() {
      try {
        if (this.user) {
          const expenses = await axios.post(
            "http://localhost:5000/all_expenses",
            {
              user_id: this.user.id,
              month: this.filters.month,
              year: this.filters.year,
            },
          )
          const categories = await axios.get("http://localhost:5000/categories")
          this.categories = categories.data
          console.log(expenses.data)
          this.expenses = expenses.data.map((item) => ({
            id: item.id,
            category: item.category ? item.category.description : null,
            description: item.description,
            price: item.price,
            date: format(item.date, "dd/MM/yyyy"),
          }))
        } else {
          console.error("User is null or undefined")
        }
      } catch (error) {
        console.error("Error fetching expenses:", error)
      }
    },
    async showHideFilters() {
      this.showFilters = !this.showFilters
      // if (!this.showFilters){
      //   this.filters.month = null
      //   this.filters.year = null
      //   await this.loadData()
      // }
    },
    async searchWithFilters() {
      var selectMonth = document.getElementById("monthSelect")
      var selectedIndexMonth = selectMonth.selectedIndex
      var month = selectMonth.options[selectedIndexMonth].value
      var selectYear = document.getElementById("yearSelect")
      var selectedIndexYear = selectYear.selectedIndex
      var year = selectYear.options[selectedIndexYear].value
      this.filters.year = year
      this.filters.month = month
      await this.loadData()
    },
  },
  async mounted() {
    if (this.user) {
      await this.loadData()
    }
  },
}
</script>

<style></style>

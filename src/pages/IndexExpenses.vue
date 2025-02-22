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
          <select class="form-control" id="monthSelect" v-model="monthSelected">
            <option
              v-for="(month, index) in months"
              :key="index"
              :value="index + 1"
            >
              {{ month }}
            </option>
          </select>
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label for="yearSelect">Anno</label>
          <select class="form-control" id="yearSelect" v-model="yearSelected">
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
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
      v-if="expenses && expenses.length"
      :expenses="expenses"
      :categories="categories"
    >
    </ExpensesTableVue>
  </div>
</template>

<script>
import ExpensesTableVue from './components/ExpensesTable.vue'
import axios from 'axios'
import { format } from 'date-fns'
import callService from '../services/api'

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
      months: [
        'Gennaio',
        'Febbraio',
        'Marzo',
        'Aprile',
        'Maggio',
        'Giugno',
        'Luglio',
        'Agosto',
        'Settembre',
        'Ottobre',
        'Novembre',
        'Dicembre',
      ],
      monthSelected: new Date().getMonth() + 1,
      yearSelected: new Date().getFullYear(),
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
          const expenses = await callService('expenses.allExpenses', {
            user_id: this.user.id,
            month: this.filters.month,
            year: this.filters.year,
          })
          const categories = await callService('categories.list', {})
          this.categories = categories
          this.expenses = expenses.map((item) => ({
            id: item.id,
            category: item.category ? item.category.description : null,
            description: item.description,
            price: item.price,
            date: format(item.date, 'dd/MM/yyyy'),
          }))
        } else {
          console.error('User is null or undefined')
        }
      } catch (error) {
        console.error('Error fetching expenses:', error)
      }
    },
    async showHideFilters() {
      this.showFilters = !this.showFilters
    },
    async searchWithFilters() {
      let year = this.yearSelected
      let month = this.monthSelected
      this.filters.year = year
      this.filters.month = month
      await this.loadData()
    },
  },
  computed: {
    years() {
      let currentYear = new Date().getFullYear()
      currentYear = Number(currentYear)
      let years = []
      for (let i = currentYear - 2; i <= currentYear + 3; i++) {
        years.push(i)
      }
      return years
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

<template>
  <div v-if="user" style="width: 95%; margin: 0 auto" class="mb-5">
    <div
      class="form-check form-switch ms-3 mb-2 d-flex justify-content-between"
    >
      <div class="">
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

      <div>
        <button @click="exportData" class="btn btn-primary ps-3 pe-3 me-3">
          Esporta
        </button>
      </div>
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
import { MONTHS } from '../utils/constants'

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
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
      showFilters: false,
      months: MONTHS,
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
    async exportData() {
      let resp = await callService('exportData.exportToExcel', {
        startDate: new Date(this.filters.year, this.filters.month - 1, 1),
        endDate: new Date(this.filters.year, this.filters.month, 0),
        userId: this.user.id,
      })

      if (resp.url) {
        const fullUrl = `http://${window.location.hostname}:5001${resp.url}`
        this.$notify({
          title: 'File Excel Generato',
          message: `Il report è stato generato"`,
          dangerouslyUseHTMLString: true,
          type: 'success',
        })
        window.open(fullUrl, '_blank')
      } else {
        this.$notify({
          title: 'File Excel Generato',
          message: `Errore durante la generazione del report"`,
          dangerouslyUseHTMLString: true,
          type: 'error',
        })
      }
    },
    async loadData() {
      try {
        if (this.user) {
          let expenses = await callService('expenses.getListWithCategories', {
            startDate: new Date(this.filters.year, this.filters.month - 1, 1),
            endDate: new Date(this.filters.year, this.filters.month, 0),
            userId: this.user.id,
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

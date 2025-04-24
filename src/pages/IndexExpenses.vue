<template>
  <div v-if="user" style="width: 95%; margin: 0 auto" class="mb-5">
    <div class="form-check form-switch mb-2 d-flex justify-content-between">
      <div>
        <label class="form-check-label" for="show-filters">Filtri</label>
        <input
          class="form-check-input"
          type="checkbox"
          id="show-filters"
          @change="showHideFilters"
          :checked="showFilters"
        />
      </div>

      <div>
        <button @click="exportData" class="btn btn-primary ps-3 pe-3 me-3">
          Esporta
        </button>
      </div>
    </div>

    <div class="row mb-2 d-flex align-items-end" v-if="showFilters">
      <div class="col-md-3">
        <label>Dal</label>
        <input type="date" class="form-control" v-model="filters.startDate" />
      </div>
      <div class="col-md-3">
        <label>Al</label>
        <input type="date" class="form-control" v-model="filters.endDate" />
      </div>
      <div class="col-md-2">
        <button class="btn btn-secondary ps-3 pe-3" @click="searchWithFilters">
          Cerca
        </button>
      </div>
    </div>

    <ExpensesTableVue
      ref="expensesTable"
      v-if="expenses && expenses.length"
      :expenses="expenses"
      :categories="categories"
    />
    <div v-else class="mt-5 pt-5">
      <p class="text-center text-muted fs-4">
        Nessuna spesa effettuata nel periodo selezionato
      </p>
    </div>
  </div>
</template>

<script>
import ExpensesTableVue from './components/ExpensesTable.vue'
import callService from '../services/api'
import { format } from 'date-fns'
import moment from 'moment'
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
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD')
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD')

    return {
      expenses: null,
      categories: null,
      filters: {
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
      showFilters: true,
      months: MONTHS,
    }
  },

  watch: {
    async user() {
      await this.loadData()
    },
  },
  methods: {
    async exportData() {
      const filteredRows =
        this.$refs.expensesTable?.$refs?.table?.$refs?.goodTable
          ?.filteredRows?.[0]?.children || []

      const filteredRowsIds = filteredRows.map((fr) => fr.id)
      let resp = await callService('exportData.exportToExcel', {
        userId: this.user.id,
        expensesIds: filteredRowsIds,
      })

      if (resp.url) {
        const fullUrl = `http://${window.location.hostname}:5001${resp.url}`
        window.open(fullUrl, '_blank')
      } else {
        this.$notify({
          title: 'Errore',
          message: `Errore durante la generazione del report`,
          type: 'error',
        })
      }
    },
    async loadData() {
      if (!this.user) return
      try {
        const startDate = moment(this.filters.startDate).format('YYYY-MM-DD')
        const endDate = moment(this.filters.endDate).format('YYYY-MM-DD')

        const expenses = await callService('expenses.getListWithCategories', {
          startDate,
          endDate,
          userId: this.user.id,
        })

        const categories = await callService('categories.list', {})

        this.categories = categories
        this.expenses = expenses.map((item) => ({
          id: item.id,
          category: item.category ? item.category.description : null,
          description: item.description,
          price: item.price,
          date: format(new Date(item.date), 'dd/MM/yyyy'),
        }))
      } catch (error) {
        console.error('Errore nel caricamento spese:', error)
      }
    },
    showHideFilters() {
      this.showFilters = !this.showFilters
    },
    async searchWithFilters() {
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

<style scoped>
.form-check-input {
  cursor: pointer;
}
</style>

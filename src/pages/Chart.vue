<template>
  <main class="container mb-5">
    <div class="text-center mb-4">
      <button
        class="btn btn-outline-secondary me-2"
        @click="showFilters = !showFilters"
      >
        <i
          class="bi me-2"
          :class="showFilters ? 'bi-eye-slash' : 'bi-eye'"
        ></i>
        {{ showFilters ? 'Nascondi Filtri' : 'Mostra Filtri' }}
      </button>
    </div>

    <div v-if="showFilters" class="filters-wrapper chart-filters">
      <div class="row g-3 align-items-end justify-content-center">
        <div class="col-12 col-md-4">
          <div class="form-group">
            <label for="startDate" class="chart-filter-label">Da</label>
            <input
              type="date"
              class="form-control"
              id="startDate"
              v-model="filters.startDate"
            />
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="form-group">
            <label for="endDate" class="chart-filter-label">A</label>
            <input
              type="date"
              class="form-control"
              id="endDate"
              v-model="filters.endDate"
            />
          </div>
        </div>
        <div class="col-12 col-md-4 col-lg-3">
          <button
            class="btn btn-primary chart-search-button w-100"
            @click="searchWithFilters"
          >
            <i class="bi bi-search me-2" aria-hidden="true"></i>
            Cerca
          </button>
        </div>
      </div>
    </div>

    <div id="container-chart">
      <div class="row w-100 mt-1 align-items-center">
        <div class="col-12 col-lg-5 mb-5 mb-lg-0">
          <table
            v-if="data && data.length > 0"
            class="table table-bordered table-hover chart-summary-table"
          >
            <thead>
              <tr>
                <th class="text-center bg-light">Categoria</th>
                <th class="text-center bg-light">Totale</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in data" :key="item.description">
                <td class="text-center">{{ item.description }}</td>
                <td class="text-center">{{ formatNumber(item.total) }}</td>
              </tr>
              <tr>
                <th class="text-center bg-light">Totale periodo</th>
                <th class="text-center bg-light">{{ sumOfTotals }} €</th>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="col-12 col-lg-7">
          <apexchart
            v-if="loading"
            type="pie"
            :options="chartOptions"
            :series="series"
          ></apexchart>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { defineComponent } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import callService from '../services/api'
import { MONTHS } from '../utils/constants'
import { isDarkTheme } from '../utils/theme'

function formatDateLocal(date) {
  return date.toLocaleDateString('sv-SE') // "YYYY-MM-DD"
}

export default defineComponent({
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = formatDateLocal(new Date(year, month, 1))
    const lastDay = formatDateLocal(new Date(year, month + 1, 0))

    return {
      showFilters: true,
      isDarkTheme,
      filters: {
        startDate: firstDay,
        endDate: lastDay,
      },
      months: MONTHS,
      data: null,
      sumOfTotals: null,
      loading: false,
      series: [],
      chartOptions: {
        chart: {
          width: '100%',
          type: 'pie',
          foreColor: isDarkTheme.value ? '#e8edf6' : '#202a3d',
        },
        theme: {
          mode: isDarkTheme.value ? 'dark' : 'light',
        },
        tooltip: {
          theme: isDarkTheme.value ? 'dark' : 'light',
        },
        legend: {
          labels: {
            colors: isDarkTheme.value ? '#e8edf6' : '#202a3d',
          },
        },
        dataLabels: {
          style: {
            colors: ['#fff'],
          },
        },
        labels: [],
        colors: [
          '#007bff',
          '#6610f2',
          '#6f42c1',
          '#dc3545',
          '#fd7e14',
          '#ffc107',
          '#28a745',
          '#20c997',
        ],
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: {
                width: '100%',
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      },
    }
  },
  watch: {
    isDarkTheme(isDark) {
      const color = isDark ? '#e8edf6' : '#202a3d'
      this.chartOptions = {
        ...this.chartOptions,
        chart: { ...this.chartOptions.chart, foreColor: color },
        theme: { mode: isDark ? 'dark' : 'light' },
        tooltip: { theme: isDark ? 'dark' : 'light' },
        legend: { ...this.chartOptions.legend, labels: { colors: color } },
      }
    },
    async user() {
      await this.loadData()
    },
  },
  methods: {
    async searchWithFilters() {
      await this.loadData()
    },
    async loadData() {
      this.loading = false

      let categories = await callService('categories.list', {})
      this.chartOptions.colors = categories.map((c) => c.color)

      let resp = await callService('expenses.getTotalByCategory', {
        userId: this.user.id,
        startDate: this.filters.startDate,
        endDate: this.filters.endDate,
      })

      this.data = resp
      this.series = resp.map((item) =>
        item.total ? parseFloat(item.total) : 0,
      )
      this.chartOptions.labels = resp.map((item) => item.description)

      let sum = 0
      resp.forEach((item) => {
        let tot = item.total || 0
        sum += parseFloat(tot)
      })
      this.sumOfTotals = this.formatNumber(sum)
      this.loading = true
    },
    formatNumber(value) {
      value = value || 0
      const number = parseFloat(value)
      if (number % 1 === 0) {
        return parseInt(number)
      }
      return number.toFixed(2)
    },
  },
  async mounted() {
    if (this.user) await this.loadData()
  },
})
</script>

<style lang="scss">
#container-chart {
  display: flex;
  align-items: center;
}
.filters-wrapper {
  transition: visibility 0.1s linear;
}

.chart-filters {
  max-width: 56rem;
  margin: 0 auto 1.5rem;
  padding: 1.25rem;
  border: 1px solid #e7ebf2;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 8px 24px rgba(27, 39, 65, 0.06);
}

.chart-filter-label {
  display: block;
  margin-bottom: 0.45rem;
  color: #596579;
  font-size: 0.85rem;
  font-weight: 700;
}

.chart-search-button {
  min-height: 2.85rem;
}

.invisible {
  visibility: hidden;
}

@media (max-width: 767.98px) {
  .chart-filters {
    padding: 1rem;
  }
}
</style>

<template>
  <main class="container mb-5">
    <div class="row container mb-2 d-flex align-items-end">
      <div class="col-md-3">
        <div class="form-group">
          <label for="startDate">Da</label>
          <input
            type="date"
            class="form-control"
            id="startDate"
            v-model="filters.startDate"
          />
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label for="endDate">A</label>
          <input
            type="date"
            class="form-control"
            id="endDate"
            v-model="filters.endDate"
          />
        </div>
      </div>
      <div class="col-md-2">
        <button class="btn btn-secondary ps-3 pe-3" @click="searchWithFilters">
          Cerca
        </button>
      </div>
    </div>

    <div id="container-chart">
      <div class="row w-100 mt-1">
        <div class="col d-flex justify-content-start">
          <table
            v-if="data && data.length > 0"
            class="table table-bordered table-hover"
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

        <div class="col">
          <apexchart
            v-if="loading"
            type="pie"
            :options="chartOptions"
            :series="series"
            width="600"
            height="600"
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
          width: 50,
          type: 'pie',
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
            breakpoint: 480,
            options: {
              chart: {
                width: 50,
              },
              legend: {},
            },
          },
        ],
      },
    }
  },
  watch: {
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
  justify-content: center;
  align-items: center;
}
</style>

<template>
  <main class="container mb-5">
    <div class="form-check form-switch container ms-3 mb-2">
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

    <div class="row container mb-2 d-flex align-items-end" v-if="showFilters">
      <div class="col-md-3">
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

    <div id="container-chart" style="height:">
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
                <td class="text-center">{{ item.total }} €</td>
              </tr>
              <tr>
                <th class="text-center bg-light">Totale periodo</th>
                <th class="text-center bg-light">{{ sum_of_totals }}</th>
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
import { defineComponent } from "vue"
import VueApexCharts from "vue3-apexcharts"
import axios from "axios"
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
    return {
      showFilters: false,
      filters: {
        month: null,
        year: null,
      },
      data: null,
      sum_of_totals: null,
      loading: false,
      series: [],
      chartOptions: {
        chart: {
          width: 50,
          type: "pie",
        },
        labels: [],
        colors: [
          "#007bff",
          "#6610f2",
          "#6f42c1",
          "#dc3545",
          "#fd7e14",
          "#ffc107",
          "#28a745",
          "#20c997",
        ],
        //colors: ['#2C3E50', '#546E7A', '#757575', '#9E9E9E', '#B0BEC5', '#CFD8DC', '#455A64', '#607D8B'],
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
    async user(oldValue, newValue) {
      await this.loadData()
    },
  },
  methods: {
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
    async loadData() {
      this.loading = false
      let resp = await axios.post("http://locahost:5000/expenses_by_category", {
        month: this.filters.month,
        year: this.filters.year,
        userId: this.user.id,
      })
      this.data = resp.data
      console.log(this.data)
      this.series = resp.data.map((item) => parseInt(item.total))
      this.chartOptions.labels = resp.data.map((item) => item.description)
      var sum = 0
      resp.data.forEach((item) => {
        sum += parseFloat(item.total)
      })
      this.sum_of_totals = sum.toFixed(2) + " €"
      this.loading = true
    },
    async showHideFilters() {
      this.showFilters = !this.showFilters
      // if (!this.showFilters){
      // this.filters.month = null
      // this.filters.year = null
      // await this.loadData()
      // }
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

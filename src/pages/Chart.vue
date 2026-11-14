<template>
  <main class="stats container">
    <header class="stats-head">
      <div>
        <h1 class="stats-title">Statistiche</h1>
        <p class="stats-sub">{{ periodLabel }}</p>
      </div>
      <button
        class="btn stats-toggle"
        type="button"
        :aria-expanded="showFilters"
        @click="showFilters = !showFilters"
      >
        <i
          class="bi"
          :class="showFilters ? 'bi-funnel-fill' : 'bi-funnel'"
          aria-hidden="true"
        ></i>
        Filtri
      </button>
    </header>

    <section v-if="showFilters" class="stats-card stats-filters">
      <div class="preset-row" role="group" aria-label="Periodi rapidi">
        <button
          v-for="p in presets"
          :key="p.key"
          type="button"
          class="preset"
          :class="{ active: activePreset === p.key }"
          @click="applyPreset(p.key)"
        >
          {{ p.label }}
        </button>
      </div>
      <form class="filter-grid" @submit.prevent="searchWithFilters">
        <div class="field">
          <span class="chart-filter-label">Dal</span>
          <DateField
            v-model="filters.startDate"
            @update:modelValue="activePreset = null"
          />
        </div>
        <div class="field">
          <span class="chart-filter-label">Al</span>
          <DateField
            v-model="filters.endDate"
            @update:modelValue="activePreset = null"
          />
        </div>
        <button type="submit" class="btn btn-primary stats-search">
          <i class="bi bi-search me-2" aria-hidden="true"></i>Cerca
        </button>
      </form>
    </section>

    <div v-if="error" class="stats-card stats-empty">
      <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
      <p>{{ error }}</p>
      <button class="btn btn-primary" type="button" @click="loadData">
        Riprova
      </button>
    </div>

    <template v-else>
      <section class="kpis" :class="{ 'is-loading': loading }">
        <article class="kpi kpi-main">
          <span class="kpi-label">Totale periodo</span>
          <strong class="kpi-value">{{ formatEuro(sumOfTotals) }}</strong>
        </article>
        <article class="kpi">
          <span class="kpi-label">Categoria top</span>
          <strong class="kpi-value kpi-text">
            {{ topCategory ? topCategory.description : '—' }}
          </strong>
          <span v-if="topCategory" class="kpi-note">
            {{ topCategory.percent }}% del totale
          </span>
        </article>
        <article class="kpi">
          <span class="kpi-label">Media giornaliera</span>
          <strong class="kpi-value">{{ formatEuro(dailyAverage) }}</strong>
          <span class="kpi-note">su {{ daysCount }} giorni</span>
        </article>
      </section>

      <section
        v-if="!loading && !rows.length"
        class="stats-card stats-empty"
      >
        <i class="bi bi-pie-chart" aria-hidden="true"></i>
        <p>Nessuna spesa nel periodo selezionato</p>
      </section>

      <section v-else class="stats-grid" :class="{ 'is-loading': loading }">
        <div class="stats-card chart-card">
          <apexchart
            v-if="rows.length"
            type="donut"
            height="340"
            :options="chartOptions"
            :series="series"
          ></apexchart>
          <div v-else class="skeleton skeleton-chart"></div>
        </div>

        <div class="stats-card list-card">
          <h2 class="list-title">Per categoria</h2>
          <ul class="cat-list" v-if="rows.length">
            <li v-for="item in rows" :key="item.id" class="cat-item">
              <div class="cat-row">
                <span class="cat-dot" :style="{ background: item.color }"></span>
                <span class="cat-name">{{ item.description }}</span>
                <span class="cat-percent">{{ item.percent }}%</span>
                <strong class="cat-total">{{ formatEuro(item.total) }}</strong>
              </div>
              <div class="cat-bar">
                <span
                  :style="{ width: item.percent + '%', background: item.color }"
                ></span>
              </div>
            </li>
          </ul>
          <div v-else class="skeleton skeleton-list"></div>
        </div>
      </section>
    </template>
  </main>
</template>

<script>
import { defineComponent, markRaw } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import {
  differenceInCalendarDays,
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns'
import { it } from 'date-fns/locale'
import callService from '../services/api'
import { isDarkTheme } from '../utils/theme'
import DateField from './components/DateField.vue'
import { formatEuro } from '../utils/number'

const iso = (d) => format(d, 'yyyy-MM-dd')
const PALETTE = [
  '#6366f1',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#84cc16',
]

export default defineComponent({
  components: { apexchart: markRaw(VueApexCharts), DateField },
  props: {
    user: { type: Object, default: null },
  },
  data() {
    const now = new Date()
    return {
      showFilters: true,
      isDarkTheme,
      activePreset: 'month',
      filters: {
        startDate: iso(startOfMonth(now)),
        endDate: iso(endOfMonth(now)),
      },
      presets: [
        { key: 'month', label: 'Questo mese' },
        { key: 'prev', label: 'Mese scorso' },
        { key: '30', label: 'Ultimi 30 giorni' },
        { key: 'year', label: "Quest'anno" },
      ],
      rows: [],
      sumOfTotals: 0,
      appliedRange: null,
      loading: true,
      error: null,
      requestId: 0,
    }
  },
  computed: {
    series() {
      return this.rows.map((r) => r.total)
    },
    topCategory() {
      return this.rows[0] || null
    },
    daysCount() {
      if (!this.appliedRange) return 1
      return Math.max(
        1,
        differenceInCalendarDays(
          parseISO(this.appliedRange.endDate),
          parseISO(this.appliedRange.startDate),
        ) + 1,
      )
    },
    dailyAverage() {
      return this.sumOfTotals / this.daysCount
    },
    periodLabel() {
      if (!this.appliedRange) return ''
      const f = (s) => format(parseISO(s), 'd MMM yyyy', { locale: it })
      return `${f(this.appliedRange.startDate)} – ${f(this.appliedRange.endDate)}`
    },
    chartOptions() {
      const dark = this.isDarkTheme
      const ink = dark ? '#e8edf6' : '#202a3d'
      const muted = dark ? '#9aa6ba' : '#738096'
      return {
        chart: {
          type: 'donut',
          foreColor: ink,
          fontFamily: 'inherit',
          background: 'transparent',
          animations: { enabled: true, speed: 350, dynamicAnimation: { speed: 250 } },
          toolbar: { show: false },
        },
        theme: { mode: dark ? 'dark' : 'light' },
        labels: this.rows.map((r) => r.description),
        colors: this.rows.map((r) => r.color),
        stroke: { width: 3, colors: [dark ? '#1b2230' : '#ffffff'] },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: {
          theme: dark ? 'dark' : 'light',
          y: { formatter: (v) => formatEuro(v) },
        },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: '70%',
              labels: {
                show: true,
                name: { color: muted, offsetY: -4 },
                value: {
                  color: ink,
                  fontSize: '1.6rem',
                  fontWeight: 750,
                  offsetY: 6,
                  formatter: (v) => formatEuro(v),
                },
                total: {
                  show: true,
                  label: 'Totale',
                  color: muted,
                  formatter: () => formatEuro(this.sumOfTotals),
                },
              },
            },
          },
        },
      }
    },
  },
  watch: {
    user(u) {
      if (u) this.loadData()
    },
  },
  methods: {
    formatEuro,
    applyPreset(key) {
      const now = new Date()
      let start
      let end
      if (key === 'month') {
        start = startOfMonth(now)
        end = endOfMonth(now)
      } else if (key === 'prev') {
        const prev = subMonths(now, 1)
        start = startOfMonth(prev)
        end = endOfMonth(prev)
      } else if (key === '30') {
        start = subDays(now, 29)
        end = now
      } else {
        start = startOfYear(now)
        end = endOfYear(now)
      }
      this.activePreset = key
      this.filters.startDate = iso(start)
      this.filters.endDate = iso(end)
      this.loadData()
    },
    async searchWithFilters() {
      await this.loadData()
    },
    async loadData() {
      if (!this.user) return
      const { startDate, endDate } = this.filters
      if (!startDate || !endDate || startDate > endDate) {
        this.error = 'La data iniziale deve precedere quella finale.'
        return
      }
      const id = ++this.requestId
      this.loading = true
      this.error = null
      try {
        const resp = await callService('expenses.getTotalByCategory', {
          userId: this.user.id,
          startDate,
          endDate,
        })
        if (id !== this.requestId) return // risposta superata da una più recente

        const items = resp
          .map((item, i) => ({
            id: item.id,
            description: item.description,
            color: item.color || PALETTE[i % PALETTE.length],
            total: parseFloat(item.total) || 0,
          }))
          .filter((item) => item.total > 0)
          .sort((a, b) => b.total - a.total)

        const sum = items.reduce((acc, item) => acc + item.total, 0)
        this.rows = items.map((item) => ({
          ...item,
          percent: sum ? Math.round((item.total / sum) * 1000) / 10 : 0,
        }))
        this.sumOfTotals = sum
        this.appliedRange = { startDate, endDate }
      } catch (e) {
        if (id !== this.requestId) return
        console.error('Errore nel caricamento statistiche:', e)
        this.error = 'Impossibile caricare le statistiche.'
      } finally {
        if (id === this.requestId) this.loading = false
      }
    },
  },
  mounted() {
    if (this.user) this.loadData()
  },
})
</script>

<style lang="scss">
.stats {
  max-width: 1080px;
  padding-bottom: 2rem;
}

.stats-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stats-title {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.stats-sub {
  margin: 0.15rem 0 0;
  color: var(--app-muted);
  font-size: 0.9rem;
}

.stats-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-ink);
}

.stats-card {
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
}

.stats-filters {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1.1rem;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset {
  padding: 0.4rem 0.95rem;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: transparent;
  color: var(--app-muted);
  font-size: 0.85rem;
  font-weight: 650;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;

  &:hover {
    border-color: var(--app-primary);
    color: var(--app-primary);
  }

  &.active {
    border-color: transparent;
    background: var(--app-primary);
    color: #fff;
  }
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.85rem;
  align-items: end;
}

.stats .field {
  display: block;
  min-width: 0;
}

.chart-filter-label {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--app-muted);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.stats-search {
  min-height: 2.85rem;
  padding-inline: 1.5rem;
}

.kpis {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  transition: opacity 150ms ease;
}

.is-loading {
  opacity: 0.55;
  pointer-events: none;
}

.kpi {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
}

.kpi-main {
  border: 0;
  background: linear-gradient(135deg, #5146e5 0%, #7c6cf5 100%);
  color: #fff;

  .kpi-label {
    color: rgba(255, 255, 255, 0.8);
  }
}

.kpi-label {
  color: var(--app-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.kpi-value {
  margin-top: 0.3rem;
  font-size: clamp(1.35rem, 3.4vw, 1.9rem);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.kpi-text {
  overflow: hidden;
  font-size: clamp(1.1rem, 2.6vw, 1.4rem);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-note {
  margin-top: 0.2rem;
  color: var(--app-muted);
  font-size: 0.8rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.chart-card {
  padding: 1rem;
}

.list-card {
  padding: 1.25rem;
}

.list-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
}

.cat-list {
  display: grid;
  gap: 0.95rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cat-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.cat-dot {
  flex: none;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
}

.cat-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-percent {
  color: var(--app-muted);
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}

.cat-total {
  min-width: 5.5rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.cat-bar {
  height: 0.4rem;
  margin-top: 0.45rem;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-muted) 18%, transparent);

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
    transition: width 350ms ease;
  }
}

.stats-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--app-muted);
  text-align: center;

  .bi {
    font-size: 2.5rem;
    opacity: 0.6;
  }

  p {
    margin: 0;
  }
}

.skeleton {
  border-radius: 1rem;
  background: color-mix(in srgb, var(--app-muted) 14%, transparent);
  animation: stats-pulse 1.2s ease-in-out infinite;
}

.skeleton-chart {
  height: 340px;
}

.skeleton-list {
  height: 220px;
}

@keyframes stats-pulse {
  50% {
    opacity: 0.5;
  }
}

html[data-theme='dark'] .stats-toggle {
  color: var(--app-ink);
}

@media (max-width: 767.98px) {
  .kpis {
    grid-template-columns: 1fr 1fr;
  }

  .kpi-main {
    grid-column: 1 / -1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stats-search {
    grid-column: 1 / -1;
  }
}
</style>

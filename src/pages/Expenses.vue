<template>
  <div v-if="user" style="width: 95%; margin: 0 auto" class="mb-5">
    <div class="exp-toolbar" ref="toolbar">
      <div class="chips" role="group" aria-label="Periodo">
        <button
          v-for="p in presets"
          :key="p.key"
          type="button"
          class="chip"
          :class="{ active: activePreset === p.key }"
          @click="applyPreset(p.key)"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="period">
        <button
          type="button"
          class="chip"
          :class="{ active: activePreset === null }"
          :aria-expanded="showPeriod"
          @click="showPeriod = !showPeriod"
        >
          <i class="bi bi-calendar-range" aria-hidden="true"></i>
          {{ activePreset === null ? customLabel : 'Periodo' }}
        </button>
        <form
          v-if="showPeriod"
          class="period-pop"
          @submit.prevent="applyCustom"
          @keydown.esc="showPeriod = false"
        >
          <div>
            <span>Dal</span>
            <DateField
              v-model="draft.startDate"
              input-class="df-input df-small"
            />
          </div>
          <div>
            <span>Al</span>
            <DateField
              v-model="draft.endDate"
              input-class="df-input df-small"
            />
          </div>
          <button type="submit" class="btn btn-primary btn-sm">
            Applica
          </button>
        </form>
      </div>
      <button @click="exportData" class="btn btn-primary btn-sm export-btn">
        <i class="bi bi-download" aria-hidden="true"></i>
        <span>Esporta</span>
      </button>
    </div>

    <section v-if="expenses && expenses.length" class="exp-summary">
      <div class="sum-main">
        <span class="sum-icon" aria-hidden="true">
          <i class="bi bi-wallet2"></i>
        </span>
        <div>
          <span class="sum-label">Totale periodo</span>
          <strong class="sum-total">{{ formatEuro(totalExpenses) }}</strong>
        </div>
      </div>
      <dl class="sum-stats">
        <div>
          <dt>Spese</dt>
          <dd>{{ expenses.length }}</dd>
        </div>
        <div>
          <dt>Media</dt>
          <dd>{{ formatEuro(totalExpenses / expenses.length) }}</dd>
        </div>
      </dl>
    </section>

    <ExpensesTableVue
      ref="expensesTable"
      v-if="expenses && expenses.length"
      :expenses="expenses"
      :categories="categories"
      @deleted="loadData"
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
import { formatEuro } from '../utils/number'
import DateField from './components/DateField.vue'
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns'
import { toast } from 'vue3-toastify'

export default {
  components: {
    ExpensesTableVue,
    DateField,
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd')

    return {
      expenses: null,
      categories: null,
      filters: {
        startDate,
        endDate,
      },
      showPeriod: false,
      draft: { startDate, endDate },
      activePreset: 'month',
      presets: [
        { key: 'month', label: 'Mese corrente' },
        { key: 'prev', label: 'Mese scorso' },
        { key: '30', label: 'Ultimi 30 giorni' },
        { key: '3m', label: 'Ultimi 3 mesi' },
        { key: '6m', label: 'Ultimi 6 mesi' },
        { key: 'year', label: "Quest'anno" },
      ],
    }
  },

  computed: {
    totalExpenses() {
      return (this.expenses || []).reduce(
        (sum, e) => sum + (parseFloat(e.price) || 0),
        0,
      )
    },
    customLabel() {
      const f = (d) => format(new Date(d), 'dd/MM/yy')
      return `${f(this.filters.startDate)} – ${f(this.filters.endDate)}`
    },
  },
  watch: {
    async user() {
      await this.loadData()
    },
  },
  methods: {
    formatEuro,
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
        const exportUrl = new URL(resp.url, window.location.origin)
        window.open(exportUrl, '_blank', 'noopener,noreferrer')
      } else {
        toast.error('Errore durante la generazione del report.')
      }
    },
    async loadData() {
      if (!this.user) return
      try {
        const startDate = this.filters.startDate
        const endDate = this.filters.endDate

        const [expenses, categories] = await Promise.all([
          callService('expenses.getListWithCategories', {
            startDate,
            endDate,
            userId: this.user.id,
          }),
          callService('categories.list', {}),
        ])

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
    applyPreset(key) {
      const now = new Date()
      const ranges = {
        month: [startOfMonth(now), endOfMonth(now)],
        prev: [startOfMonth(subMonths(now, 1)), endOfMonth(subMonths(now, 1))],
        30: [subDays(now, 29), now],
        '3m': [startOfMonth(subMonths(now, 2)), endOfMonth(now)],
        '6m': [startOfMonth(subMonths(now, 5)), endOfMonth(now)],
        year: [startOfYear(now), endOfYear(now)],
      }
      const [start, end] = ranges[key]
      this.activePreset = key
      this.showPeriod = false
      this.filters.startDate = format(start, 'yyyy-MM-dd')
      this.filters.endDate = format(end, 'yyyy-MM-dd')
      this.loadData()
    },
    async applyCustom() {
      const { startDate, endDate } = this.draft
      if (!startDate || !endDate) {
        toast.warning('Seleziona entrambe le date.')
        return
      }
      if (startDate > endDate) {
        toast.warning('La data iniziale deve precedere quella finale.')
        return
      }
      this.filters.startDate = startDate
      this.filters.endDate = endDate
      this.activePreset = null
      this.showPeriod = false
      await this.loadData()
    },
    closeOnOutside(e) {
      if (e.target.closest?.('.dp__menu')) return
      if (this.showPeriod && !this.$refs.toolbar?.querySelector('.period')?.contains(e.target)) {
        this.showPeriod = false
      }
    },
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeOnOutside)
  },
  async mounted() {
    document.addEventListener('click', this.closeOnOutside)
    if (this.user) {
      await this.loadData()
    }
  },
}
</script>

<style scoped>
.exp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.chips {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  padding: 0.25rem;
  overflow-x: auto;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface);
  scrollbar-width: none;
}

.toolbar-end {
  display: flex;
  flex: none;
}

.chips::-webkit-scrollbar {
  display: none;
}

.chip {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.35rem;
  min-height: 0;
  padding: 0.3rem 0.8rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--app-muted);
  font-size: 0.78rem;
  font-weight: 650;
  white-space: nowrap;
  transition:
    background-color 140ms ease,
    color 140ms ease;
}

.chip:hover {
  background: color-mix(in srgb, var(--app-primary) 10%, transparent);
  color: var(--app-primary);
}

.chip.active {
  background: var(--app-primary);
  color: #fff;
}

.period {
  position: relative;
  flex: none;
}

.period .chip {
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
}

.period .chip.active {
  border-color: transparent;
  background: var(--app-primary);
}

.period-pop {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  z-index: 20;
  display: grid;
  gap: 0.6rem;
  width: 13.5rem;
  padding: 0.85rem;
  border: 1px solid var(--app-border);
  border-radius: 1rem;
  background: var(--app-surface);
  box-shadow: 0 16px 40px rgba(20, 28, 48, 0.18);
  animation: pop-in 140ms ease-out;
}

.period-pop label span {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--app-muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.period-pop .form-control {
  min-height: 2.2rem;
  font-size: 0.85rem;
}

.export-btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.3rem;
  border-radius: 999px;
  font-size: 0.82rem;
}

.exp-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--app-border);
  border-radius: 1rem;
  background: var(--app-surface);
}

.sum-main {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.sum-icon {
  display: grid;
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--app-primary) 12%, transparent);
  color: var(--app-primary);
  font-size: 1.1rem;
}

.sum-label {
  display: block;
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.05em;
  line-height: 1.2;
  text-transform: uppercase;
}

.sum-total {
  display: block;
  font-size: 1.35rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.sum-stats {
  display: flex;
  gap: 1.5rem;
  margin: 0;
}

.sum-stats > div {
  text-align: right;
}

.sum-stats dt {
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.sum-stats dd {
  margin: 0;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
}

@media (max-width: 575.98px) {
  .exp-summary {
    padding: 0.75rem 0.9rem;
  }

  .sum-stats {
    gap: 1rem;
  }

  .exp-toolbar {
    flex-wrap: wrap;
  }

  .chips {
    flex-basis: 100%;
    order: 3;
  }

  .export-btn {
    margin-left: auto;
  }

  .period-pop {
    position: fixed;
    top: auto;
    right: 1rem;
    bottom: 1rem;
    left: 1rem;
    width: auto;
  }
}
</style>

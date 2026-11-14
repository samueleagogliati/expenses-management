<template>
  <div class="table-shell">
    <VueGoodTable
      ref="goodTable"
      max-height="100%"
      max-width="100%"
      :columns="columns"
      :rows="items"
      styleClass="vgt-table nice-table"
      :line-numbers="summaryRowEnabled"
      :search-options="{
        enabled: false,
        trigger: 'enter',
        placeholder: 'Cerca',
      }"
      :sort-options="{
        enabled: true,
        initialSortBy: { field: 'date', type: 'asc' },
      }"
      :pagination-options="{
        enabled: true,
        mode: 'records',
        perPage: 20,
        position: 'top',
        dropdownAllowAll: false,
        nextLabel: 'Prossima',
        prevLabel: 'Precedente',
        ofLabel: 'of',
        rowsPerPageLabel: 'Righe',
        infoFn: (params) => `Pagina ${params.currentPage}`,
      }"
    >
      <template #table-row="props">
        <span v-if="props.column.label == ''">
          <button
            class="row-delete"
            type="button"
            aria-label="Elimina spesa"
            @click="deleteRow(props.row.id)"
          >
            <i class="bi bi-trash3"></i>
          </button>
        </span>
        <span v-else-if="props.column.field === 'category'" class="cat-pill">
          <i
            class="cat-dot"
            :style="{ background: colorOf(props.row.category) }"
          ></i>
          {{ props.row.category }}
        </span>
        <span v-else-if="props.column.field === 'price'" class="price-cell">
          {{ props.formattedRow[props.column.field] }}
        </span>
        <span v-else-if="props.column.field === 'date'" class="date-cell">
          {{ props.formattedRow[props.column.field] }}
        </span>
        <span v-else>{{ props.formattedRow[props.column.field] }}</span>
      </template>

      <template #column-filter="{ column }">
        <VueDatePicker
          v-if="column.filterOptions.customFilter"
          locale="it"
          :enable-time-picker="false"
          :dateInputFormat="'dd-MM-yyyy'"
          v-model="date"
          @update:model-value="ciao"
        >
        </VueDatePicker>
      </template>
      <template #table-actions-bottom>
        <div v-if="summaryRowEnabled" class="vgt-table-summary">
          <div
            v-for="(column, i) in columns"
            :key="i"
            :class="`vgt-table-summary-item ${column.tdClass}`"
          >
            <span v-html="column.footerFn ? column.footerFn() : ''"></span>
          </div>
        </div>
      </template>
    </VueGoodTable>
  </div>
</template>

<script>
import { format } from 'date-fns'
import { VueGoodTable } from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import callService from '../../services/api'
export default {
  emits: ['deleted'],
  props: {
    columns: {
      type: Array,
    },
    items: {
      type: Array,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    summaryRowEnabled: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    VueGoodTable,
    VueDatePicker,
  },
  data() {
    return {
      date: null,
    }
  },
  methods: {
    colorOf(description) {
      const c = (this.categories || []).find((x) => x.description === description)
      return c?.color || '#8b93a7'
    },
    ciao() {
      this.columns[3].filterOptions.filterValue = this.date
        ? format(this.date, 'dd/MM/yyyy')
        : ''
    },
    async deleteRow(expenseId) {
      if (confirm('Sei sicuro di voler eliminare questa spesa?')) {
        try {
          let resp = await callService('expenses.deleteExpense', {
            id: expenseId,
          })
          if (resp.status === 200) {
            this.$emit('deleted')
          } else {
            alert(resp.message)
          }
        } catch (error) {
          alert("Si è verificato un errore durante l'eliminazione della spesa")
          console.error("Errore durante l'eliminazione della spesa: ", error)
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.table-shell {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  -webkit-overflow-scrolling: touch;
}

:deep(.vgt-wrap) {
  border: 0;
}

:deep(.vgt-wrap__footer) {
  border: 0;
  border-bottom: 1px solid var(--app-border);
  background: transparent;
  padding: 0.65rem 1rem;
  color: var(--app-muted);
  font-size: 0.82rem;
}

:deep(.vgt-wrap__footer .footer__navigation__page-btn) {
  color: var(--app-primary);
  font-weight: 650;
}

:deep(.vgt-wrap__footer select),
:deep(.vgt-wrap__footer .footer__row-count__select) {
  border-radius: 0.5rem;
  font-size: 0.82rem;
}

:deep(table.vgt-table) {
  min-width: 640px;
  border: 0;
  background: transparent;
  font-size: 0.9rem;
}

:deep(table.vgt-table thead th) {
  padding: 0.7rem 1rem;
  border: 0;
  border-bottom: 1px solid var(--app-border);
  background: color-mix(in srgb, var(--app-muted) 7%, var(--app-surface));
  color: var(--app-muted);
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  vertical-align: middle;
}

:deep(table.vgt-table thead th.filter-th) {
  padding: 0.35rem 0.75rem;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface);
  text-transform: none;
}

:deep(table.vgt-table thead th.text-end) {
  text-align: right;
}

:deep(table.vgt-table th.sorting-asc:after),
:deep(table.vgt-table th.sorting-desc:before) {
  border-top-color: var(--app-primary);
  border-bottom-color: var(--app-primary);
}

:deep(table.vgt-table tbody td) {
  padding: 0.7rem 1rem;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--app-border) 70%, transparent);
  background: transparent;
  color: var(--app-ink);
  vertical-align: middle;
}

:deep(table.vgt-table tbody tr:last-child td) {
  border-bottom: 0;
}

:deep(table.vgt-table tbody tr:hover td) {
  background: color-mix(in srgb, var(--app-primary) 6%, transparent);
}

:deep(table.vgt-table tbody th.line-numbers) {
  border: 0;
  border-right: 1px solid var(--app-border);
  background: transparent;
  color: var(--app-muted);
  font-size: 0.75rem;
  font-weight: 600;
}

:deep(.vgt-input),
:deep(.vgt-select) {
  height: 2rem;
  padding: 0 0.6rem;
  border: 1px solid var(--app-border);
  border-radius: 0.6rem;
  background: var(--app-surface);
  font-size: 0.8rem;
}

:deep(.vgt-input:focus),
:deep(.vgt-select:focus) {
  border-color: var(--app-primary);
  outline: 0;
}

:deep(.vgt-table-summary) {
  border-top: 1px solid var(--app-border);
  background: color-mix(in srgb, var(--app-primary) 6%, var(--app-surface));
}

:deep(.vgt-table-summary .vgt-table-summary-item) {
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
}

.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.18rem 0.7rem 0.18rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-muted) 12%, transparent);
  font-size: 0.82rem;
  font-weight: 650;
}

.cat-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
}

.price-cell {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.date-cell {
  color: var(--app-muted);
  font-variant-numeric: tabular-nums;
}

.row-delete {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 0;
  border-radius: 0.6rem;
  background: transparent;
  color: var(--app-muted);
  transition:
    background-color 140ms ease,
    color 140ms ease;

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }
}
</style>

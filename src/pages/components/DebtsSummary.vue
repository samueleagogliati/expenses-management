<template>
  <div class="container mt-4">
    <div class="card summary-card">
      <div class="card-header bg-transparent border-0 pt-3 px-4">
        <h2 class="h6 mb-0 summary-title">Riepilogo debiti</h2>
      </div>
      <div v-if="summary && summary.length > 0" class="card-body pt-0">
        <ul class="list-group list-group-flush">
          <li
            v-for="debt in summary"
            :key="`${debt.payer.id}-${debt.receiver.id}`"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              <i class="bi bi-people-fill me-2 text-secondary"></i>
              {{ debt.payer.firstname }} deve a {{ debt.receiver.firstname }}
            </span>
            <span
              class="amount-pill">{{ formatEuro(debt.amount) }}</span
            >
          </li>
        </ul>
        <div
          class="card-footer bg-transparent border-0 d-flex justify-content-end align-items-center mt-3"
        >
          <span class="total-label me-3">Totale complessivo</span>
          <span class="total-value">{{ formatEuro(total) }}</span>
        </div>
      </div>
      <div v-else class="card-body text-center text-muted">
        <p class="mb-0">Nessun debito da saldare</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatEuro } from '../../utils/number'
defineProps({
  summary: {
    type: Array,
    default: () => [],
  },
  total: {
    type: String,
    default: '0.00',
  },
})
</script>

<style scoped>
.summary-card {
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
}

.summary-title {
  font-weight: 750;
}

.list-group-item {
  padding-inline: 0;
  background-color: transparent;
  border-color: var(--app-border);
}

.amount-pill {
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-primary) 12%, transparent);
  color: var(--app-primary);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.total-label {
  color: var(--app-muted);
  font-size: 0.8rem;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.total-value {
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
  font-weight: 750;
}
</style>

<template>
  <div class="container mt-5">
    <div class="card shadow-sm">
      <div class="card-header bg-dark text-white">
        <h5 class="mb-0">Riepilogo</h5>
      </div>
      <div v-if="summary && summary.length > 0">
        <ul class="list-group list-group-flush">
          <li
            v-for="debt in summary"
            :key="`${debt.payer.id}-${debt.receiver.id}`"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              <i class="fa-solid fa-user-group me-2 text-secondary"></i>
              {{ debt.payer.firstname }} deve a {{ debt.receiver.firstname }}
            </span>
            <span class="badge bg-primary rounded-pill fs-6"
              >{{ debt.amount }} €</span
            >
          </li>
        </ul>
        <div class="card-footer d-flex justify-content-end align-items-center">
          <h6 class="mb-0 me-3">Totale Complessivo:</h6>
          <span class="fs-5 fw-bold text-success">{{ total }} €</span>
        </div>
      </div>
      <div v-else class="card-body text-center text-muted">
        <p class="mb-0">Nessun debito da saldare</p>
      </div>
    </div>
  </div>
</template>

<script setup>
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
.card-header h5 {
  font-weight: 300;
}
.fw-bold {
  font-weight: 600 !important;
}
</style>

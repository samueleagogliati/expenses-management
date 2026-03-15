<template>
  <div class="container mt-5">
    <div class="card shadow-custom border-0 rounded-4">
      <div class="card-header bg-transparent border-0 pt-3 px-4">
        <h5 class="mb-0 fw-bold">Riepilogo Debiti</h5>
      </div>
      <div v-if="summary && summary.length > 0" class="card-body pt-0">
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
            <span
              class="badge bg-light-purple text-purple rounded-pill fs-6 fw-bold"
              >{{ debt.amount }} €</span
            >
          </li>
        </ul>
        <div
          class="card-footer bg-transparent border-0 d-flex justify-content-end align-items-center mt-3"
        >
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
.shadow-custom {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08) !important;
}
.fw-bold {
  font-weight: 600 !important;
}
.list-group-item {
  background-color: transparent;
  border-color: #f0f0f0;
}
.bg-light-purple {
  background-color: #f2eefc !important;
}
.text-purple {
  color: #764ba2 !important;
}
.text-success {
  color: #198754 !important;
}
.card-footer h6 {
  color: #6c757d;
}
</style>

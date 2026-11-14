<template>
  <button
    class="note-fab"
    type="button"
    data-bs-toggle="modal"
    data-bs-target="#notesModal"
    aria-label="Apri le note"
    title="Note"
  >
    <i class="bi bi-journal-text" aria-hidden="true"></i>
    <span v-if="count" class="note-fab-badge">{{ count }}</span>
  </button>
</template>

<script>
export default {
  props: {
    count: { type: Number, default: 0 },
  },
}
</script>

<style scoped>
.note-fab {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 1030;
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #5146e5, #7c6cf5);
  box-shadow: 0 10px 24px rgba(81, 70, 229, 0.4);
  color: #fff;
  font-size: 1.4rem;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.note-fab:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 14px 28px rgba(81, 70, 229, 0.5);
}

.note-fab:active {
  transform: scale(0.97);
}

.note-fab-badge {
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  min-width: 1.35rem;
  padding: 0.1rem 0.35rem;
  border: 2px solid var(--app-surface, #fff);
  border-radius: 999px;
  background: #ef4444;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.2;
}
</style>

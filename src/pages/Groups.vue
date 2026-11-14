<template>
  <div class="container groups-page">
    <header class="groups-head">
      <div>
        <h1 class="groups-title">Gruppi</h1>
      </div>
      <button
        class="btn btn-primary add-btn"
        data-bs-toggle="modal"
        data-bs-target="#addGroupModal"
      >
        <i class="bi bi-plus-lg" aria-hidden="true"></i>
        <span>Nuovo gruppo</span>
      </button>
    </header>

    <div v-if="groups.length" class="groups-grid">
      <article
        v-for="group in groups"
        :key="group.id"
        class="group-card"
        tabindex="0"
        role="link"
        @click="$router.push(`/groups/${group.id}`)"
        @keydown.enter="$router.push(`/groups/${group.id}`)"
      >
        <span class="group-avatar" aria-hidden="true">
          {{ (group.name || '?').charAt(0).toUpperCase() }}
        </span>
        <h2 class="group-name">{{ group.name }}</h2>
        <i class="bi bi-chevron-right group-arrow" aria-hidden="true"></i>
        <button
          class="group-delete"
          type="button"
          aria-label="Elimina gruppo"
          @click.stop="deleteGroup(group.id)"
        >
          <i class="bi bi-trash3"></i>
        </button>
      </article>
    </div>

    <div v-else class="groups-empty">
      <i class="bi bi-people" aria-hidden="true"></i>
      <p>Non hai ancora nessun gruppo</p>
    </div>

    <AddGroupModal
      :groups="groups"
      :user="props.user"
      @refreshUser="reloadGroups"
    />
  </div>
</template>

<script setup>
import callService from '../services/api'
import { ref } from 'vue'
import AddGroupModal from './components/AddGroupModal.vue'
const props = defineProps({
  user: {
    type: Object,
    default: () => ({ groups: [] }),
  },
})
const groups = ref(props.user?.groups || [])

const reloadGroups = async () => {
  const res = await callService('users.getUser', { id: props.user.id })
  groups.value = res.groups
}

const deleteGroup = async (groupId) => {
  if (!confirm('Eliminare questo gruppo?')) return
  await callService('groups.deleteGroup', { group_id: groupId })
  reloadGroups()
}
</script>

<style scoped>
.groups-page {
  max-width: 880px;
}

.groups-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.groups-title {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex: none;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.9rem;
}

.group-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--app-border);
  border-radius: 1.15rem;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  cursor: pointer;
  transition:
    transform 140ms ease,
    border-color 140ms ease;
}

.group-card:hover,
.group-card:focus-visible {
  transform: translateY(-2px);
  border-color: var(--app-primary);
}

.group-avatar {
  display: grid;
  flex: none;
  width: 2.8rem;
  height: 2.8rem;
  place-items: center;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, #5146e5, #7c6cf5);
  color: #fff;
  font-size: 1.15rem;
  font-weight: 750;
}

.group-name {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-size: 1rem;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-arrow {
  color: var(--app-muted);
  transition: transform 140ms ease;
}

.group-card:hover .group-arrow {
  color: var(--app-primary);
  transform: translateX(2px);
}

.group-delete {
  display: grid;
  width: 1.9rem;
  height: 1.9rem;
  place-items: center;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: var(--app-muted);
  transition:
    background-color 140ms ease,
    color 140ms ease;
}

.group-delete:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.groups-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 3rem 1rem;
  border: 1px dashed var(--app-border);
  border-radius: 1.25rem;
  color: var(--app-muted);
}

.groups-empty .bi {
  font-size: 2.4rem;
  opacity: 0.6;
}

.groups-empty p {
  margin: 0;
}

@media (max-width: 575.98px) {
  .add-btn span {
    display: none;
  }
}
</style>

<template>
  <div class="container py-3">
    <div class="row justify-content-center">
      <div class="col-12 col-md-10 col-lg-8">
        <h1 class="mb-4 text-center">I Tuoi Gruppi</h1>

        <div class="row g-3 g-md-4">
          <div
            class="col-12 col-sm-6"
            v-for="group in groups"
            :key="group.id"
          >
            <div
              class="card h-100 shadow-sm border-0 rounded-4 group-card"
              @click="$router.push(`/groups/${group.id}`)"
            >
              <i
                class="bi bi-x-lg text-danger position-absolute top-0 end-0 m-2 delete-icon"
                @click.stop="deleteGroup(group.id)"
              ></i>
              <div
                class="card-body text-center d-flex flex-column justify-content-center py-4"
              >
                <h3 class="card-title mb-0 text-uppercase h5">
                  {{ group.name }}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-4 mt-md-5">
          <button
            class="btn btn-dark btn-lg px-4 py-3 rounded-pill shadow w-100 w-sm-auto"
            data-bs-toggle="modal"
            data-bs-target="#addGroupModal"
          >
            <i class="bi bi-plus-circle me-2"></i> Aggiungi Gruppo
          </button>
        </div>

        <AddGroupModal
          :groups="groups"
          :user="props.user"
          @refreshUser="reloadGroups"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import callService from '../services/api'
import { ref } from 'vue'
import AddGroupModal from './components/AddGroupModal.vue'
const emit = defineEmits([])
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
  await callService('groups.deleteGroup', { group_id: groupId })
  reloadGroups()
}
</script>

<style scoped>
.group-card {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
  cursor: pointer;
}
.group-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.07) !important;
  border-color: #c9c5ff;
}

.card-title {
  font-weight: 700;
  color: #333;
}

.delete-icon {
  opacity: 0.7;
  transition: opacity 0.2s;
  cursor: pointer;
  z-index: 10;
}

.group-card:hover .delete-icon {
  opacity: 1;
}

@media (hover: hover) {
  .delete-icon {
    opacity: 0;
  }
}

@media (min-width: 576px) {
  .w-sm-auto {
    width: auto !important;
  }
}
</style>

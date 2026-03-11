<template>
  <div class="container py-2 w-50">
    <h1 class="mb-5 text-center">I Tuoi Gruppi</h1>

    <div class="row g-4">
      <div class="col-md-6 col-lg-6" v-for="group in groups" :key="group.id">
        <div
          class="card h-100 shadow border-0 rounded-1 group-card w-"
          @click="$router.push(`/groups/${group.id}`)"
        >
          <i
            class="fas fa-times text-danger position-absolute top-0 end-0 m-2 delete-icon"
            @click.stop="deleteGroup(group.id)"
          ></i>
          <div
            class="card-body text-center d-flex flex-column justify-content-center py-4"
          >
            <h3 class="card-title mb-2 text-uppercase">
              {{ group.name }}
            </h3>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-5">
      <button
        class="btn btn-dark btn-lg px-4 py-3 rounded-pill shadow"
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
</template>

<script setup>
import callService from '../services/api'
import { ref, onMounted } from 'vue'
import AddGroupModal from './components/AddGroupModal.vue'
const emit = defineEmits([])
const groups = ref([])
const props = defineProps({
  user: {
    type: Object,
    default: () => ({ groups: [] }),
  },
})

onMounted(async () => {
  groups.value = props.user?.groups || []
})

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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1.2rem rgba(0, 0, 0, 0.15);
}
.delete-icon {
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  z-index: 10;
}
.group-card:hover .delete-icon {
  opacity: 1;
}
</style>

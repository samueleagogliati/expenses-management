<template>
  <div class="container py-3">
    <div class="row justify-content-center">
      <div class="col-12 col-md-10 col-lg-8">
        <h1 class="mb-4 text-center">I Tuoi Gruppi</h1>

        <transition-group name="list" tag="div" class="row g-3 g-md-4">
          <div
            class="col-12 col-sm-6"
            v-for="(group, index) in groups"
            :key="group.id"
            :style="{ 'transition-delay': `${index * 50}ms` }"
          >
            <div
              class="card h-100 shadow-sm border-0 rounded-4 group-card"
              @click="$router.push(`/groups/${group.id}`)"
            >
              <i
                class="fas fa-times text-danger position-absolute top-0 end-0 m-2 delete-icon"
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
        </transition-group>

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
  background: #ffffff;
  border: 1px solid #f0f0f0;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  cursor: pointer;
}
.group-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08) !important;
  border-color: #764ba2;
}

.card-title {
  font-weight: 700;
  color: #333;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.delete-icon {
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  z-index: 10;
}

/* Desktop: mostra l'icona solo quando passi sopra col mouse */
.group-card:hover .delete-icon {
  opacity: 1;
}

/* Mobile/Tablet: mostra sempre l'icona perché non esiste l'hover */
@media (hover: none) {
  .delete-icon {
    opacity: 1;
  }
}

/* Utility per il bottone: larghezza automatica sopra i 576px */
@media (min-width: 576px) {
  .w-sm-auto {
    width: auto !important;
  }
}
</style>

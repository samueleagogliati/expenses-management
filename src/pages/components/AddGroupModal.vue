<template>
  <div
    class="modal fade"
    id="addGroupModal"
    tabindex="-1"
    aria-labelledby="addGroupModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4">
        <div class="modal-header">
          <h3 class="modal-title text-center w-100" id="addGroupModalLabel">
            Gruppo
          </h3>

          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Chiudi"
          ></button>
        </div>
        <div class="modal-body">
          <ValidatedForm
            form-id="groupForm"
            :fields="formFields"
            @success="submitGroup"
          >
            <div class="mb-3">
              <label for="userSelect" class="form-label">Utente</label>
              <select
                id="userSelect"
                v-model="selectedUser"
                class="form-select"
                required
              >
                <option value="" disabled>Seleziona un utente</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label for="groupName" class="form-label">Nome</label>
              <input
                type="text"
                id="groupName"
                v-model="groupName"
                class="form-control"
                placeholder="Inserisci il nome del gruppo"
                required
              />
            </div>

            <div class="text-end mt-3">
              <button type="submit" class="btn btn-dark">Salva</button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import callService from '../../services/api'
import ValidatedForm from './ValidatedForm.vue'

const selectedUser = ref('')
const groupName = ref('')
const users = ref([])
const emit = defineEmits(['refreshUser'])

const props = defineProps({
  user: {
    type: Object,
    default: () => ({ groups: [] }),
  },
  groups: {
    type: Array,
    default: [],
  },
})

const formFields = [
  {
    selector: '#userSelect',
    rules: [{ rule: 'required', errorMessage: 'Seleziona un utente' }],
  },
  {
    selector: '#groupName',
    rules: [{ rule: 'required', errorMessage: 'Inserisci il nome del gruppo' }],
  },
]

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  try {
    const res = await callService('users.list', {})
    users.value = res
      .map((user) => ({
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
      }))
      .filter((u) => u.id != props.user.id)
  } catch (e) {
    console.error('Failed to load users', e)
  }
}

async function submitGroup() {
  if (!selectedUser.value || !groupName.value) return

  const params = {
    name: groupName.value,
    user_id: selectedUser.value,
    logged_user_id: props.user.id,
  }

  await callService('groups.createGroup', params)

  selectedUser.value = ''
  groupName.value = ''
  window.$('#addGroupModal').modal('hide')
  emit('refreshUser')
}
</script>

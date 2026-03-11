<template>
  <ButtonNote />
  <Modal
    modal-id="notesModal"
    title="Note"
    :content-style="{ minHeight: '70vh' }"
    @close="handleClose"
  >
    <template #header>
      <h3 class="h-100 w-100 align-content-center text-center">Note</h3>
    </template>
    <template #body>
      <ul class="list-group list-group-flush">
        <li
          v-for="(note, index) in notes"
          :key="note.id || index"
          class="d-flex align-items-center fs-5 py-2"
        >
          <div class="d-flex w-100 justify-content-between align-items-center">
            <div class="input-group w-100">
              <input
                class="form-control"
                type="text"
                v-model="note.description"
                @focus="note.editMode = true"
              />
              <button
                v-if="note.editMode"
                @click="updateNote(note)"
                class="btn"
              >
                <i class="fa-solid fa-check text-dark"></i>
              </button>
              <button @click="deleteNote(note)" class="btn">
                <i class="fa-solid fa-trash text-danger"></i>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </template>
    <template #footer>
      <div class="input-group" @keyup.enter="addNote">
        <input
          v-model="newNoteDescription"
          class="form-control py-2 fs-5"
          placeholder="Aggiungi nota"
        />
        <button @click="addNote" class="btn py-2 btn-dark">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import callService from '../../services/api'
import Modal from './Modal.vue'
import ButtonNote from './ButtonNote.vue'

const notes = ref([])
const newNoteDescription = ref(null)
const props = defineProps({
  user: {
    type: Object,
    default: () => ({ groups: [] }),
  },
})

const loadNotes = async () => {
  if (!props.user?.id) return
  notes.value = (
    await callService('notes.list', { user_id: props.user.id })
  ).map((n) => ({ ...n, editMode: false }))
}

watch(
  () => props.user?.id,
  async (newId) => {
    if (newId) {
      await loadNotes()
    }
  },
  { immediate: true },
)

const deleteNote = async (note) => {
  await callService('notes.deleteNote', { id: note.id })
  await loadNotes()
}
const updateNote = async (note) => {
  note.editMode = false
  const params = {
    id: note.id,
    description: note.description,
  }
  await callService('notes.updateNote', params)
  await loadNotes()
}
const addNote = async () => {
  if (!newNoteDescription.value?.trim()) return
  const params = {
    description: newNoteDescription.value,
    user_id: props.user.id,
  }
  await callService('notes.createNote', params)
  newNoteDescription.value = null
  await loadNotes()
}

const handleClose = async () => {
  await loadNotes()
}
</script>

<style lang="scss" scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
}

.note-icon {
  fill: #3b8bdb;
  border-radius: 8px;
  padding: 6px;
  background-color: #f5f5f5;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    fill 0.3s;
}

.note-icon:hover {
  transform: scale(1.1);
  fill: #1e88e5;
}

.form-control {
  background-color: transparent;
  border-top: 0;
  border-right: 0;
  border-left: 0;
  border-radius: 0;
  &:focus {
    border-color: #111;
    outline: none;
    box-shadow: none;
  }
}
</style>

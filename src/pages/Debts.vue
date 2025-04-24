<template>
  <button
    style="position: relative; left: 20px; top: 100px"
    class="btn"
    data-bs-toggle="modal"
    data-bs-target="#notesModal"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="48"
      height="48"
      style="
        cursor: pointer;
        transition:
          transform 0.2s ease,
          fill 0.3s;
      "
      class="note-icon"
    >
      <path
        fill="currentColor"
        d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 1.99 2 1.99h14c1.1 0 1.99-.9 1.99-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5zm7-2h4v-2h-4v2zm-2-3h6v-2H10v2zm-2-3h8v-2H8v2z"
      />
    </svg>
  </button>

  <div
    class="modal fade"
    id="notesModal"
    tabindex="-1"
    aria-labelledby="dayModal"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
      <div class="modal-content" style="min-height: 70vh">
        <div class="modal-header w-100">
          <h3 class="h-100 w-100 align-content-center text-center">Note</h3>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <ul class="list-group list-group-flush">
            <li
              v-for="(note, index) in notes"
              :key="index"
              class="d-flex align-items-center fs-5 py-2"
            >
              <div
                class="d-flex w-100 justify-content-between align-items-center"
              >
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
        </div>
        <div class="modal-footer" @keyup.enter="addNote">
          <div class="input-group">
            <input
              v-model="newNoteDescription"
              class="form-control py-2 fs-5"
              placeholder="Aggiungi nota"
            />
            <button @click="addNote" class="btn py-2 btn-dark">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="d-flex justify-content-center" style="margin-top: 100px">
    <div class="card p-4 shadow" style="width: 60%" @keyup.enter="saveDebt">
      <div class="card-body text-center">
        <div class="d-flex justify-content-around align-items-center">
          <template v-if="direction === 'to'">
            <span
              class="form-select w-25 d-flex align-items-center justify-content-center text-uppercase fw-bold"
            >
              {{ user.firstname }}
            </span>
          </template>
          <template v-else>
            <select class="form-select w-25" v-model="payer" :value="payer?.id">
              <option v-for="user in users" :value="user" :key="user.id">
                {{ user.firstname }}
              </option>
            </select>
          </template>

          <button
            @click="toggleDirection"
            class="btn btn-outline-secondary d-flex align-items-center justify-content-center mx-3"
            style="width: 48px; height: 48px"
          >
            <i class="fa-duotone fa-solid fa-arrow-right-arrow-left"></i>
          </button>

          <template v-if="direction === 'to'">
            <select
              class="form-select w-25"
              v-model="receiver"
              :value="receiver?.id"
            >
              <option v-for="user in users" :value="user" :key="user.id">
                {{ user.firstname }}
              </option>
            </select>
          </template>
          <template v-else>
            <span
              class="form-select w-25 d-flex align-items-center justify-content-center text-uppercase fw-bold"
            >
              {{ user.firstname }}
            </span>
          </template>
        </div>

        <div class="input-group mb-3 mt-5">
          <input
            v-model="price"
            autocomplete="off"
            id="price"
            type="text"
            class="form-control"
            style="width: 15%"
            placeholder="Prezzo"
          />
          <input
            v-model="description"
            autocomplete="off"
            id="description"
            type="text"
            class="form-control ms-5"
            style="width: 65%"
            placeholder="Descrizione"
          />
        </div>

        <button
          class="text-center btn btn-dark mt-3 px-4 py-2 text-uppercase"
          @click="saveDebt"
        >
          Salva
        </button>
      </div>
    </div>
  </div>

  <div class="debts-list mt-5 container">
    <div
      class="row debt-item align-items-center py-2 border-bottom"
      v-for="(debt, index) in debts"
      :key="index"
    >
      <div class="col d-flex align-items-center">
        <p
          class="m-0 fs-6"
          :class="{ 'text-decoration-line-through': debt.disabled }"
        >
          {{ printDebt(debt) }} <b>{{ debt.description }}</b>
        </p>
      </div>
      <div class="col-auto d-flex">
        <i
          class="fa-solid fa-eye-slash text-primary me-3"
          style="cursor: pointer"
          @click="toggleDisabled(debt)"
        ></i>
        <i
          class="fa-solid fa-trash text-danger"
          style="cursor: pointer"
          @click="deleteDebt(debt)"
        ></i>
      </div>
    </div>
  </div>

  <div class="mt-5 d-flex justify-content-center">
    <button
      v-if="debts.length"
      class="text-center btn btn-danger mt-3 px-4 py-2 text-uppercase"
      @click="deleteDisabledDebt"
    >
      Elimina righe completate
    </button>
  </div>
</template>

<script>
import callService from '../services/api'
import { jwtDecode } from 'jwt-decode'

export default {
  name: 'Debts',
  data() {
    return {
      price: null,
      description: null,
      direction: 'to',
      payer: null,
      receiver: null,
      debts: [],
      notes: [],
      newNoteDescription: null,
      user: {},
      users: [],
    }
  },
  methods: {
    async toggleDisabled(debt) {
      debt.disabled = !debt.disabled
      await callService('debts.updateDebt', debt)
    },
    printDebt(debt) {
      return `${debt.payer.firstname} deve a ${debt.receiver.firstname} ${debt.price}€ di`
    },
    toggleDirection() {
      this.direction = this.direction === 'to' ? 'from' : 'to'
      const temp = this.receiver
      this.receiver = this.payer
      this.payer = temp
    },
    async saveDebt() {
      await callService('debts.createDebt', {
        price: this.price,
        description: this.description,
        payer_id: this.payer?.id || this.user.id,
        receiver_id: this.receiver?.id || this.user.id,
        disabled: false,
      })
      await this.loadData()
      this.price = null
      this.description = null
    },
    async deleteDebt(debt) {
      await callService('debts.deleteDebt', { id: debt.id })
      await this.loadData()
    },
    async deleteDisabledDebt() {
      await callService('debts.deleteDisabledDebt', {})
      await this.loadData()
    },
    async loadData() {
      this.debts = await callService('debts.list', {})
      this.notes = (await callService('notes.list', {})).map((n) => {
        return { ...n, editMode: false }
      })
      this.payer = this.user
      this.receiver = this.users[0]
    },
    async deleteNote(note) {
      await callService('notes.deleteNote', { id: note.id })
      await this.loadData()
    },
    async updateNote(note) {
      let params = {
        id: note.id,
        description: note.description,
        user_id: note.user_id,
      }
      await callService('notes.updateNote', params)
      await this.loadData()
    },
    async addNote() {
      let params = {
        description: this.newNoteDescription,
        user_id: this.user.id,
      }
      await callService('notes.createNote', params)
      this.newNoteDescription = null
      await this.loadData()
    },
    async loadUser() {
      const token = localStorage.getItem('token')
      const decodedToken = jwtDecode(token)
      let resp = await callService('users.getUser', { id: decodedToken.id })
      this.user = resp
    },
    async loadUsers() {
      let resp = await callService('users.list', {})
      this.users = resp.filter((user) => user.id != this.user.id)
    },
  },
  async mounted() {
    await this.loadUser()
    await this.loadUsers()
    await this.loadData()
  },
}
</script>

<style lang="scss" scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
}

.debt-item {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
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

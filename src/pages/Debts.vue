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
      <div class="modal-content" style="min-height: 80vh">
        <div class="modal-header w-100">
          <h3
            class="h-100 w-100 align-content-center text-center"
            id="notesModalLabel"
          >
            Note
          </h3>
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
              class="list-group-item d-flex align-items-center fs-5"
            >
              <div
                class="d-flex w-100 justify-content-between align-items-center"
              >
                <input
                  v-if="note.editMode"
                  v-model="note.description"
                  class="form-control me-3"
                />
                <span v-else>{{ note.description }}</span>

                <div>
                  <button
                    @click="toggleEditMode(note)"
                    class="btn mx-1"
                    type="button"
                  >
                    <i v-if="!note.editMode" class="fa-solid fa-pencil"></i>
                    <i v-else class="fa-solid fa-check"></i>
                  </button>

                  <button @click="deleteNote(note)" class="btn" type="button">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="d-flex justify-content-center" style="margin-top: 100px">
    <div class="card p-4 shadow" style="width: 60%" @keyup.enter="saveDebt">
      <div class="card-body text-center">
        <div class="d-flex justify-content-around align-items-center">
          <span
            class="input-group-text w-25 d-flex justify-content-center align-items-center text-uppercase fw-bold"
          >
            {{ payer }}
          </span>
          <button
            @click="toggleDirection"
            class="btn btn-outline-secondary d-flex align-items-center justify-content-center p-0"
            style="width: 38px; height: 38px"
          >
            <i class="fa-duotone fa-solid fa-arrow-right-arrow-left"></i>
          </button>
          <span
            class="input-group-text w-25 d-flex justify-content-center align-items-center text-uppercase fw-bold"
          >
            {{ receiver }}
          </span>
        </div>

        <div class="input-group mb-3 mt-5">
          <span class="input-group-text" style="width: 20%">Prezzo</span>
          <input
            v-model="price"
            autocomplete="off"
            id="price"
            type="text"
            class="form-control"
            style="width: 15%"
          />
          <input
            v-model="description"
            autocomplete="off"
            id="description"
            type="text"
            class="form-control"
            style="width: 65%"
            placeholder="Descrizione spesa"
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
      class="text-center btn btn-danger mt-3 px-4 py-2 text-uppercase"
      @click="deleteDisabledDebt"
    >
      Elimina spese completate
    </button>
  </div>
</template>

<script>
import callService from '../services/api'
export default {
  name: 'Debts',
  data() {
    return {
      price: null,
      description: null,
      direction: 'to',
      payer: 'Samu',
      receiver: 'Est',
      debts: [],
      notes: [],
    }
  },
  methods: {
    toggleEditMode(note) {
      note.editMode = !note.editMode
    },
    async toggleDisabled(debt) {
      debt.disabled = !debt.disabled
      await callService('debts.updateDebt', debt)
    },
    printDebt(debt) {
      return `${debt.payer} deve a ${debt.receiver} ${debt.price}€ di`
    },
    toggleDirection() {
      this.direction = this.direction === 'to' ? 'from' : 'to'
      ;[this.payer, this.receiver] = [this.receiver, this.payer]
    },
    async saveDebt() {
      await callService('debts.createDebt', {
        price: this.price,
        description: this.description,
        payer: this.payer,
        receiver: this.receiver,
        disabled: false,
      })
      await this.loadData()
      this.price = null
      this.description = null
    },
    async deleteDebt(debt) {
      await callService('debts.deleteDebt', {
        id: debt.id,
      })
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
    },
  },
  async mounted() {
    await this.loadData()
  },
}
</script>

<style>
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
</style>

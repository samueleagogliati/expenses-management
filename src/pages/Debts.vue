<template>
  <div class="d-flex justify-content-center">
    <div class="card p-4 shadow" style="width: 60%">
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

  <div class="debts-list">
    <div class="row" v-for="(debt, index) in debts" :key="index">
      <p>{{ printDebt(debt) }}</p>
    </div>
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
      debts: [
        { payer: 'Samu', receiver: 'Est', price: 5, description: 'diocane' },
      ],
    }
  },
  methods: {
    printDebt(debt) {
      return `${debt.payer} deve a ${debt.receiver} ${price}€`
    },
    toggleDirection() {
      this.direction = this.direction === 'to' ? 'from' : 'to'
      ;[this.payer, this.receiver] = [this.receiver, this.payer]
    },
    async saveDebt() {
      let resp = await callService('debts.createDebt', {
        price: this.price,
        description: this.description,
        payer: this.payer,
        receiver: this.receiver,
        disabled: false,
      })
      console.log(resp)
    },
  },
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
}
</style>

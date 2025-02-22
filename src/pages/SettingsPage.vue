<template>
  <div
    class="container-fluid d-flex flex-column align-items-center justify-content-center bg-light p-4"
    style="width: 50%"
  >
    <div
      v-for="(category, index) in categories"
      :key="category.id"
      class="category-item row align-items-center w-50"
    >
      <div class="col-6 text-start">
        <span>{{ category.description }}</span>
      </div>

      <div class="col-3 text-center">
        <input
          type="color"
          v-model="category.color"
          @input="updateColor(index, $event.target.value)"
        />
      </div>
    </div>
    <button @click="saveColors" class="btn btn-primary mt-4">
      Salva Colori
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import callService from '../services/api'
export default {
  data() {
    return {
      categories: [],
    }
  },
  methods: {
    updateColor(index, color) {
      this.categories[index].color = color
    },
    saveColors() {
      console.log('Colori salvati:', this.categories)
      alert('Colori salvati con successo!')
    },
    async loadData() {
      this.categories = await callService('categories.list', {})
    },
  },
  async mounted() {
    await this.loadData()
  },
}
</script>

<style scoped>
.category-item {
  margin-bottom: 10px;
}

.category-item .col {
  padding: 5px;
}

button {
  width: 150px;
  text-align: center;
}
</style>

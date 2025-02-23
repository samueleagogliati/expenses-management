<template>
  <div
    class="container-fluid d-flex flex-column align-items-center justify-content-center bg-light p-4"
    style="width: 50%"
  >
    <div
      v-for="(category, index) in categories"
      :key="category.id"
      class="category-item row align-items-center w-50 mt-2"
    >
      <div class="col-6 text-start">
        <span>{{ category.description }}</span>
      </div>

      <div class="col-3 text-center">
        <input type="color" v-model="category.color" />
      </div>
    </div>
    <button @click="saveColors" class="btn btn-primary mt-4">
      Salva Colori
    </button>
  </div>
</template>

<script>
import callService from '../services/api'

export default {
  data() {
    return {
      categories: [],
    }
  },
  methods: {
    async saveColors() {
      try {
        const updatedCategories = this.categories.map((category) => ({
          id: category.id,
          color: category.color,
        }))

        for (let i = 0; i < updatedCategories.length; i++) {
          await callService('categories.updateCategory', updatedCategories[i])
        }
      } catch (error) {
        console.error('Errore nel salvataggio dei colori:', error)
        return
      }
      alert('Colori Aggiornati')
    },

    async loadData() {
      try {
        this.categories = await callService('categories.list', {})
      } catch (error) {
        console.error('Errore nel caricamento delle categorie:', error)
      }
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

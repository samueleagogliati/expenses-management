<template>
  <div class="container settings-page py-4">
    <div
      v-for="category in categories"
      :key="category.id"
      class="category-item row align-items-center mt-2"
    >
      <div class="col-8 col-sm-6 text-start">
        <span>{{ category.description }}</span>
      </div>

      <div class="col-4 col-sm-3 text-center">
        <input type="color" v-model="category.color" />
      </div>
    </div>
    <button @click="saveColors" class="btn btn-primary mt-4 w-100 w-sm-auto">
      Salva Colori
    </button>
  </div>
</template>

<script>
import callService from '../services/api'
import { toast } from 'vue3-toastify'

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

        await Promise.all(
          updatedCategories.map((category) =>
            callService('categories.updateCategory', category),
          ),
        )
      } catch (error) {
        console.error('Errore nel salvataggio dei colori:', error)
        toast.error('Errore durante il salvataggio dei colori.')
        return
      }
      toast.success('Colori aggiornati.')
    },

    async loadData() {
      try {
        this.categories = await callService('categories.list', {})
      } catch (error) {
        console.error('Errore nel caricamento delle categorie:', error)
        toast.error('Errore durante il caricamento delle categorie.')
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
  padding: 0.8rem 1rem;
  border: 1px solid var(--app-border);
  border-radius: 0.85rem;
  background: var(--app-surface);
}

.category-item input[type='color'] {
  width: 3rem;
  height: 2.5rem;
  padding: 0.2rem;
  border: 1px solid var(--app-border);
  border-radius: 0.65rem;
  background: transparent;
}

@media (min-width: 576px) {
  .w-sm-auto {
    width: auto !important;
  }
}
</style>

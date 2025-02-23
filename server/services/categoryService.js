import Category from '../models/category.js'

export default {
  async list() {
    return await Category.query().orderBy('description')
  },

  async updateCategory(params) {
    try {
      const { id, ...updatedFields } = params

      if (!id) {
        throw new Error('ID mancante')
      }
      const category = await Category.query().findById(id)
      if (!category) {
        throw new Error('Categoria non trovata')
      }

      const updateCategory = await Category.query().patchAndFetchById(
        id,
        updatedFields,
      )

      return {
        status: 200,
        message: 'Categoria aggiornata',
        data: updateCategory,
      }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },
}

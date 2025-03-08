import Note from '../models/note.js'

export default {
  async list() {
    return await Note.query()
  },

  async createNote(params) {
    try {
      if (!params.description || !params.user_id) {
        throw new Error('Tutti i campi sono obbligatori')
      }
      const newNote = await Note.query().insert(params)

      return {
        status: 200,
        message: 'Nota inserita',
        data: newNote,
      }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },

  async deleteNote({ id }) {
    try {
      const deletedCount = await Note.query().deleteById(id)

      if (deletedCount === 0) {
        throw new Error('Nota non trovata')
      }

      return { status: 200, message: 'Nota eliminata' }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },

  async updateNote(params) {
    try {
      const { id, ...updatedFields } = params

      if (!id) {
        throw new Error('ID mancante')
      }
      const debt = await Note.query().findById(id)
      if (!debt) {
        throw new Error('Nota non trovata')
      }

      const updatedDebt = await Note.query().patchAndFetchById(
        id,
        updatedFields,
      )

      return { status: 200, message: 'Nota aggiornata', data: updatedDebt }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },
}

import Note from '../models/note.js'

export default {
  async list(params) {
    if (!params.user_id) {
      return []
    }
    return await Note.query()
      .where('user_id', params.user_id)
      .orderBy('id', 'asc')
  },

  async createNote(params) {
    try {
      if (!params.description || !params.user_id) {
        return { success: false, message: 'Descrizione o utente mancante.' }
      }
      await Note.query().insert(params)
      return { success: true, message: 'Nota creata con successo.' }
    } catch (error) {
      return {
        success: false,
        message: 'Errore nella creazione della nota: ' + error.message,
      }
    }
  },

  async deleteNote(params) {
    try {
      const { id } = params
      if (!id) {
        return { success: false, message: 'ID della nota mancante.' }
      }
      const deletedCount = await Note.query().deleteById(id)
      if (deletedCount === 0) {
        return { success: false, message: 'Nota non trovata.' }
      }
      return { success: true, message: 'Nota eliminata con successo.' }
    } catch (error) {
      return {
        success: false,
        message: "Errore nell'eliminazione della nota: " + error.message,
      }
    }
  },

  async updateNote(params) {
    try {
      const { id, ...updatedFields } = params
      if (!id) {
        return { success: false, message: 'ID della nota mancante.' }
      }
      const updatedCount = await Note.query().patchAndFetchById(
        id,
        updatedFields,
      )
      if (!updatedCount) {
        return { success: false, message: 'Nota non trovata.' }
      }
      return { success: true, message: 'Nota aggiornata con successo.' }
    } catch (error) {
      return {
        success: false,
        message: "Errore nell'aggiornamento della nota: " + error.message,
      }
    }
  },
}

import Debt from '../models/debt.js'

export default {
  async list() {
    return await Debt.query()
  },

  async createDebt(params) {
    try {
      const { payer, receiver, price, description, disabled } = params

      if (!payer || !receiver || !price || !description) {
        throw new Error('Tutti i campi sono obbligatori')
      }
      const newDebt = await Debt.query().insert({
        payer,
        receiver,
        price,
        description,
        disabled,
      })

      return {
        status: 200,
        message: 'Debito inserito',
        data: newDebt,
      }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },

  async deleteDebt({ id }) {
    try {
      const deletedCount = await Debt.query().deleteById(id)

      if (deletedCount === 0) {
        throw new Error('Debito non trovato')
      }

      return { status: 200, message: 'Debito eliminato' }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },

  async deleteDisabledDebt() {
    try {
      await Debt.query().where('disabled', true).del()
      return { status: 200, message: 'Debiti disabilitati eliminati' }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },

  async updateDebt(params) {
    try {
      const { id, ...updatedFields } = params

      if (!id) {
        throw new Error('ID mancante')
      }
      const debt = await Debt.query().findById(id)
      if (!debt) {
        throw new Error('Debito non trovato')
      }

      const updatedDebt = await Debt.query().patchAndFetchById(
        id,
        updatedFields,
      )

      return { status: 200, message: 'Debito aggiornato', data: updatedDebt }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },
}

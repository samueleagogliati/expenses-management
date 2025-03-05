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
      const newExpense = await Debt.query().insert({
        payer,
        receiver,
        price,
        description,
        disabled,
      })

      return {
        status: 200,
        message: 'Debito inserito',
        data: newExpense,
      }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },
}

import Expense from '../models/expense.js'
import moment from 'moment'

const list = (userId, startDate, endDate) => {
  let start = moment(startDate).startOf('day').toDate()
  let end = moment(endDate).endOf('day').toDate()
  let collection = Expense.query()
    .where('user_id', userId)
    .whereBetween('date', [start, end])

  return collection
}

export default {
  async getTotalOfPeriod({ userId, startDate, endDate }) {
    let collection = list(userId, startDate, endDate)
    collection.sum('price as total')
    let result = await collection
    return result[0]?.total || 0
  },

  async getTotalOfDays({ userId, startDate, endDate }) {
    let collection = list(userId, startDate, endDate)
    collection.select('date').sum('price as total').groupBy('date')
    return await collection
  },

  async getListWithCategories({ userId, startDate, endDate }) {
    let collection = list(userId, startDate, endDate)
    collection.withGraphFetched('category')
    return collection
  },

  async createExpense(params) {
    try {
      const { price, category_id, description, date, user_id } = params

      if (!price || !category_id || !description || !date || !user_id) {
        throw new Error('Tutti i campi sono obbligatori')
      }
      const newExpense = await Expense.query().insert({
        price,
        category_id,
        description,
        date: new Date(date),
        user_id,
      })

      return {
        status: 200,
        message: 'Spesa inserita',
        data: newExpense,
      }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },

  async updateExpense(params) {
    try {
      const { id, ...updatedFields } = params

      if (!id) {
        throw new Error('ID mancante')
      }
      const expense = await Expense.query().findById(id)
      if (!expense) {
        throw new Error('Spesa non trovata')
      }

      const updatedExpense = await Expense.query().patchAndFetchById(
        id,
        updatedFields,
      )

      return { status: 200, message: 'Spesa aggiornata', data: updatedExpense }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },

  async deleteExpense({ id }) {
    try {
      const deletedCount = await Expense.query().deleteById(id)

      if (deletedCount === 0) {
        throw new Error('Spesa non trovata')
      }

      return { status: 200, message: 'Spesa eliminata' }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },
}

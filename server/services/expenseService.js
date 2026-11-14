import Expense from '../models/expense.js'
import Category from '../models/category.js'
import moment from 'moment'
import parseDecimal from '../helpers/parseDecimal.js'

const list = (userId, startDate, endDate) => {
  let start = moment(startDate).format('YYYY-MM-DD')
  let end = moment(endDate).format('YYYY-MM-DD')

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

  async getListByIds({ userId, expensesIds }) {
    return await Expense.query()
      .whereIn('expenses.id', expensesIds)
      .where('user_id', userId)
      .withGraphFetched('category')
  },

  async getTotalOfDays({ userId, startDate, endDate }) {
    let collection = list(userId, startDate, endDate)
    collection.select('date').sum('price as total').groupBy('date')
    return await collection
  },

  async getListWithCategories({ userId, startDate, endDate }) {
    let collection = list(userId, startDate, endDate)
    collection.withGraphFetched('category').orderBy('date')
    return collection
  },

  async getTotalByCategory({ userId, startDate, endDate }) {
    let start = moment(startDate).startOf('day').toDate()
    let end = moment(endDate).endOf('day').toDate()

    let collection = Category.query()
      .select('categories.id', 'categories.description', 'categories.color')
      .leftJoin('expenses', function () {
        this.on('expenses.category_id', '=', 'categories.id')
          .andOn(Category.raw('expenses.user_id = ?', [Number(userId)]))
          .andOnBetween('expenses.date', [start, end])
      })
      .groupBy('categories.id', 'categories.description', 'categories.color')
      .orderBy('categories.description')
      .sum('expenses.price as total')
    return await collection
  },

  async createExpense(params) {
    try {
      const { category_id, description, date, user_id } = params
      const price = parseDecimal(params.price)

      if (Number.isNaN(price) || price < 0) {
        throw new Error('Prezzo non valido')
      }
      if (!category_id || !description || !date || !user_id) {
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
      const { id, ...rest } = params
      const allowed = ['category_id', 'description', 'price']
      const updatedFields = Object.fromEntries(
        Object.entries(rest).filter(([k]) => allowed.includes(k)),
      )

      if (!id) {
        throw new Error('ID mancante')
      }
      if ('price' in updatedFields) {
        const price = parseDecimal(updatedFields.price)
        if (Number.isNaN(price) || price < 0) throw new Error('Prezzo non valido')
        updatedFields.price = price
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

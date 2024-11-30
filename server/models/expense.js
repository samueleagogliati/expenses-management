import { Model } from 'objection'
import Category from './category.js'

class Expense extends Model {
  static get tableName() {
    return 'expenses'
  }

  static async saveData(data) {
    try {
      const expense = await Expense.query().insert(data)
      return expense
    } 
    catch (error) {
      throw error
    }
  }

  static async deleteExpense(expense_id) {
    try {
      const expense = await Expense.query().findById(expense_id)
      if (!expense) {
        throw new Error('Expense non trovata')
      }
      await Expense.query().deleteById(expense_id)
      return 'Expense eliminata con successo'
    }
    catch (error) {
      throw error
    }
  }

  static async getTotalExpensesByMonthAndYearAndUser(month, year, userId) {
    try {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)
  
      const totalExpenses = await Expense.query()
        .where('date', '>=', startDate)
        .andWhere('date', '<=', endDate)
        .andWhere('user_id', userId)
        .select(Expense.raw('SUM(price) AS total'))

      const total = totalExpenses[0].total
  
      return total
    } 
    catch (error) {
      throw error
    }
  }
  

  static async getExpensesByDayAndUser(month, year, userId) {
    try {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)
  
      const expensesByDay = []
  
      for (let day = 1; day <= endDate.getDate(); day++) {
        const total = await Expense.getTotalExpensesByDay(month, day, year, userId)
  
        expensesByDay.push({ day, total })
      }
  
      return expensesByDay
    } catch (error) {
      throw error
    }
  }
  

  static async getTotalExpensesByDay(month, day, year, userId) {
    try {
      const startDate = new Date(year, month, day, 0, 0, 0)
      const endDate = new Date(year, month, day, 23, 59, 59)
  
      const totalExpenses = await Expense.query()
        .where('date', '>=', startDate)
        .andWhere('date', '<=', endDate)
        .andWhere('user_id', userId)
        .select(Expense.raw('SUM(price) AS total'))
  
      const total = totalExpenses[0].total
  
      return total
    } catch (error) {
      throw error
    }
  }
  

  static get relationMappings() {
    return {
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: 'expenses.category_id',
          to: 'categories.id'
        }
      }
    }
  }
}

export default Expense

import GroupDebt from '../models/group_debt.js'
import Expense from '../models/expense.js'
import Group from '../models/group.js'
import moment from 'moment'

const createDebtsAndExpenses = async ({
  price,
  description,
  categoryId,
  payerId,
  splits,
  groupId,
  date,
}) => {
  const expenses = []
  const formattedDate = new Date(date)

  for (const [uid, amount] of Object.entries(splits)) {
    if (parseFloat(amount) > 0) {
      const exp = await Expense.query().insert({
        price: parseFloat(amount),
        description,
        category_id: categoryId,
        user_id: parseInt(uid),
        date: formattedDate,
      })
      expenses.push(exp)
    }
  }

  for (const [uid, amount] of Object.entries(splits)) {
    if (parseInt(uid) !== parseInt(payerId) && parseFloat(amount) > 0) {
      const userExpense = expenses.find((e) => e.user_id == uid)

      await GroupDebt.query().insert({
        group_id: groupId,
        payer_id: parseInt(uid),
        receiver_id: parseInt(payerId),
        price: parseFloat(amount),
        date: formattedDate,
        description,
        category_id: categoryId,
        expense_id: userExpense ? userExpense.id : null,
        disabled: false,
      })
    }
  }
}

export default {
  async createGroupDebt(params) {
    try {
      await createDebtsAndExpenses(params)
      return { status: 200, success: true, message: 'Debito creato' }
    } catch (error) {
      console.error(error)
      return {
        status: 500,
        success: false,
        message: 'Errore: ' + error.message,
      }
    }
  },

  async updateGroupDebt(params) {
    try {
      const { id, groupId } = params
      const expenseId = id

      const originalMainExpense = await Expense.query().findById(expenseId)
      if (!originalMainExpense) {
        throw new Error('Spesa originale non trovata')
      }

      const originalDate = moment(originalMainExpense.date).format('YYYY-MM-DD')
      const originalDescription = originalMainExpense.description

      const group = await Group.query()
        .findById(groupId)
        .withGraphFetched('users')
      if (!group) throw new Error('Gruppo non trovato')
      const userIds = group.users.map((u) => u.id)

      const siblings = await Expense.query()
        .whereIn('user_id', userIds)
        .whereRaw('LOWER(description) = ?', [
          originalDescription.toLowerCase().trim(),
        ])
        .whereBetween('date', [originalDate, originalDate])

      const siblingIds = siblings.map((e) => e.id)

      if (siblingIds.length > 0) {
        await GroupDebt.query().whereIn('expense_id', siblingIds).delete()

        await Expense.query().whereIn('id', siblingIds).delete()
      }

      await createDebtsAndExpenses(params)

      return { status: 200, success: true, message: 'Spesa aggiornata' }
    } catch (error) {
      console.error(error)
      return {
        status: 500,
        success: false,
        message: 'Errore: ' + error.message,
      }
    }
  },

  async updateDebt(params) {
    try {
      const { id, disabled } = params
      await GroupDebt.query().patchAndFetchById(id, { disabled })
      return { status: 200, success: true }
    } catch (error) {
      return { status: 500, success: false, message: error.message }
    }
  },

  async deleteDebt(params) {
    try {
      await GroupDebt.query().deleteById(params.id)
      return { status: 200, success: true, message: 'Debito eliminato' }
    } catch (error) {
      return { status: 500, success: false, message: error.message }
    }
  },

  async updateAllDebtsInGroup(params) {
    try {
      const { group_id, disabled } = params
      await GroupDebt.query().where('group_id', group_id).patch({ disabled })
      return { status: 200, success: true, message: 'Debiti aggiornati' }
    } catch (error) {
      return { status: 500, success: false, message: error.message }
    }
  },

  async deleteDisabledDebt(params) {
    try {
      const { group_id } = params
      await GroupDebt.query()
        .where('group_id', group_id)
        .where('disabled', true)
        .delete()
      return { status: 200, success: true, message: 'Debiti saldati eliminati' }
    } catch (error) {
      return { status: 500, success: false, message: error.message }
    }
  },
}

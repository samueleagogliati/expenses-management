import GroupDebt from '../models/groupDebt.js'
import Expense from '../models/expense.js'
import Group from '../models/group.js'
import moment from 'moment'

export default {
  async list() {
    return await GroupDebt.query().withGraphFetched('[payer, receiver]')
  },

  async createGroupDebt(params) {
    try {
      const { description, categoryId, payerId, splits, groupId, date } = params

      const createdExpenses = []
      const formattedDate = new Date(date)

      for (const [userId, amount] of Object.entries(splits)) {
        if (parseFloat(amount) > 0) {
          const expense = await Expense.query().insert({
            price: parseFloat(amount),
            description,
            category_id: categoryId,
            user_id: parseInt(userId, 10),
            date: formattedDate,
          })
          createdExpenses.push(expense)
        }
      }

      for (const [userId, amount] of Object.entries(splits)) {
        if (
          parseInt(userId, 10) !== parseInt(payerId, 10) &&
          parseFloat(amount) > 0
        ) {
          const userExpense = createdExpenses.find((e) => e.user_id == userId)
          await GroupDebt.query().insert({
            group_id: groupId,
            payer_id: parseInt(userId, 10),
            receiver_id: parseInt(payerId, 10),
            price: parseFloat(amount),
            date: formattedDate,
            description,
            disabled: false,
          })
        }
      }
      return {
        success: true,
        message: 'Debito inserito',
      }
    } catch (error) {
      return { success: false, message: 'Errore: ' + error.message }
    }
  },

  async deleteDebt(params) {
    try {
      const { id } = params
      const deletedCount = await GroupDebt.query().deleteById(id)

      if (deletedCount === 0) {
        return { success: false, message: 'Debito non trovato' }
      }

      return { success: true, message: 'Debito eliminato' }
    } catch (error) {
      return { success: false, message: 'Errore: ' + error.message }
    }
  },

  async deleteDisabledDebt(params) {
    try {
      const { group_id } = params
      if (!group_id) {
        throw new Error('ID del gruppo non fornito')
      }
      await GroupDebt.query()
        .where('disabled', true)
        .where('group_id', group_id)
        .delete()
      return { success: true, message: 'Debiti completati eliminati' }
    } catch (error) {
      return { success: false, message: 'Errore: ' + error.message }
    }
  },

  async updateDebt(params) {
    try {
      const { id, ...updatedFields } = params

      if (!id) {
        return { success: false, message: 'ID mancante' }
      }
      const debt = await GroupDebt.query().findById(id)
      if (!debt) {
        return { success: false, message: 'Debito non trovato' }
      }

      const updatedDebt = await GroupDebt.query().patchAndFetchById(
        id,
        updatedFields,
      )

      return { success: true, message: 'Debito aggiornato', data: updatedDebt }
    } catch (error) {
      return { success: false, message: 'Errore: ' + error.message }
    }
  },

  async updateGroupDebt(params) {
    try {
      const { id, groupId } = params
      const expenseId = id

      if (!expenseId) {
        throw new Error(
          "ID della spesa principale mancante per l'aggiornamento.",
        )
      }

      const originalMainExpense = await Expense.query().findById(expenseId)
      if (!originalMainExpense) {
        throw new Error("Spesa originale non trovata per l'aggiornamento.")
      }

      const originalDate = moment(originalMainExpense.date).format('YYYY-MM-DD')
      const originalDescription = originalMainExpense.description

      const group = await Group.query()
        .findById(groupId)
        .withGraphFetched('users')
      if (!group) throw new Error('Gruppo non trovato.')
      const userIds = group.users.map((u) => u.id)

      const siblingExpenses = await Expense.query()
        .whereIn('user_id', userIds)
        .whereRaw('LOWER(description) = ?', [
          originalDescription.toLowerCase().trim(),
        ])
        .where('date', originalDate)

      const siblingExpenseIds = siblingExpenses.map((e) => e.id)

      if (siblingExpenseIds.length > 0) {
        await GroupDebt.query()
          .where('group_id', groupId)
          .where('date', originalDate)
          .whereRaw('LOWER(description) = ?', [
            originalDescription.toLowerCase().trim(),
          ])
          .delete()
        await Expense.query().whereIn('id', siblingExpenseIds).delete()
      }

      await this.createGroupDebt(params)

      return { success: true, message: 'Spesa aggiornata con successo' }
    } catch (error) {
      console.error('Errore in updateGroupDebt:', error)
      return { success: false, message: 'Errore: ' + error.message }
    }
  },

  async updateAllDebtsInGroup(params) {
    try {
      const { group_id, disabled } = params
      if (!group_id) {
        throw new Error('ID del gruppo non fornito')
      }
      await GroupDebt.query().where('group_id', group_id).patch({
        disabled: disabled,
      })
      return { success: true, message: 'Tutti i debiti sono stati aggiornati.' }
    } catch (error) {
      return { success: false, message: 'Errore: ' + error.message }
    }
  },
}

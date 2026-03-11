import GroupDebt from '../models/groupDebt.js'
import Expense from '../models/expense.js'

export default {
  async list() {
    return await GroupDebt.query().withGraphFetched('[payer, receiver]')
  },

  async createGroupDebt(params) {
    try {
      const splits = Object.entries(params.splits).map(([userId, amount]) => ({
        userId,
        amount,
      }))

      for (const split of splits) {
        if (split.userId != params.payerId) {
          const debtPayload = {
            payer_id: split.userId,
            receiver_id: params.payerId,
            price: split.amount,
            group_id: params.groupId,
            disabled: false,
            description: params.description,
            date: params.date,
          }
          await GroupDebt.query().insert(debtPayload)
        }

        await Expense.query().insert({
          price: split.amount,
          category_id: params.categoryId,
          description: params.description,
          date: params.date,
          user_id: split.userId,
        })
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

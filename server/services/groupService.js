import Group from '../models/group.js'
import GroupUser from '../models/groupUser.js'

export default {
  async list(params) {
    const userId = params.user_id
    return await Group.query()
      .innerJoinRelated('users')
      .where('users.id', userId)
      .select('groups.name')
  },

  async getGroup(params) {
    const groupId = params.group_id
    const group = await Group.query()
      .withGraphFetched('users')
      .withGraphFetched('[group_debts(orderByDate).[payer, receiver]]')
      .modifiers({
        orderByDate(builder) {
          builder.orderBy('date', 'desc').orderBy('id', 'desc')
        },
      })
      .where('groups.id', groupId)
      .first()

    if (!group) {
      return group
    }

    const balances = {}
    group.group_debts.forEach((debt) => {
      if (debt.disabled) {
        return
      }
      const { payer_id, receiver_id, price } = debt

      if (!balances[payer_id]) {
        balances[payer_id] = {}
      }
      if (!balances[payer_id][receiver_id]) {
        balances[payer_id][receiver_id] = 0
      }

      balances[payer_id][receiver_id] += parseFloat(price)
    })

    const summary = []
    const processedPairs = new Set()

    for (const payerIdStr in balances) {
      const payerId = parseInt(payerIdStr, 10)
      for (const receiverIdStr in balances[payerIdStr]) {
        const receiverId = parseInt(receiverIdStr, 10)

        const pairKey =
          payerId < receiverId
            ? `${payerId}-${receiverId}`
            : `${receiverId}-${payerId}`
        if (processedPairs.has(pairKey)) {
          continue
        }

        const amountOwed = balances[payerId]?.[receiverId] || 0
        const amountOwedBack = balances[receiverId]?.[payerId] || 0
        const netAmount = amountOwed - amountOwedBack

        if (netAmount !== 0) {
          let from, to, amount
          if (netAmount > 0) {
            from = group.users.find((u) => u.id === payerId)
            to = group.users.find((u) => u.id === receiverId)
            amount = netAmount
          } else {
            from = group.users.find((u) => u.id === receiverId)
            to = group.users.find((u) => u.id === payerId)
            amount = -netAmount
          }

          if (from && to) {
            summary.push({
              payer: from,
              receiver: to,
              amount: amount,
            })
          }
        }
        processedPairs.add(pairKey)
      }
    }

    const total = summary.reduce((sum, item) => sum + item.amount, 0)

    group.debt_summary = summary.map((s) => ({
      ...s,
      amount: s.amount.toFixed(2),
    }))
    group.debt_total = total.toFixed(2)

    return group
  },

  async createGroup(params) {
    try {
      const { name, user_id, logged_user_id } = params

      if (!name || !user_id || !logged_user_id) {
        throw new Error('Tutti i campi sono obbligatori')
      }
      const newGroup = await Group.query().insert({
        name,
      })

      await GroupUser.query().insert({
        group_id: newGroup.id,
        user_id,
      })

      await GroupUser.query().insert({
        group_id: newGroup.id,
        user_id: logged_user_id,
      })

      return {
        status: 200,
        message: 'Gruppo inserito',
        data: newGroup,
      }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },

  async deleteGroup({ group_id }) {
    try {
      await GroupUser.query().where('group_id', group_id).delete()
      const deletedCount = await Group.query().deleteById(group_id)

      if (deletedCount === 0) {
        throw new Error('Grouppo non trovato')
      }

      return { status: 200, message: 'Gruppo eliminato' }
    } catch (error) {
      console.log('error', error)
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },
}

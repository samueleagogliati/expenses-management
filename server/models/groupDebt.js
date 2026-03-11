import { Model } from 'objection'
import User from './user.js'

class GroupDebt extends Model {
  static get tableName() {
    return 'group_debts'
  }

  static get relationMappings() {
    return {
      payer: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'group_debts.payer_id',
          to: 'users.id',
        },
      },
      receiver: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'group_debts.receiver_id',
          to: 'users.id',
        },
      },
    }
  }
}
export default GroupDebt

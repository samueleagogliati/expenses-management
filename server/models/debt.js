import { Model } from 'objection'
import User from './user.js'

class Debt extends Model {
  static get tableName() {
    return 'debts'
  }

  static get relationMappings() {
    return {
      payer: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'debts.payer_id',
          to: 'users.id',
        },
      },
      receiver: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'debts.receiver_id',
          to: 'users.id',
        },
      },
    }
  }
}
export default Debt

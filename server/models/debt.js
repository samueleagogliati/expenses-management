import { Model } from 'objection'

class Debt extends Model {
  static get tableName() {
    return 'debts'
  }
}
export default Debt

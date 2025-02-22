import { Model } from 'objection'
import Category from './category.js'

class Expense extends Model {
  static get tableName() {
    return 'expenses'
  }

  static get relationMappings() {
    return {
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: 'expenses.category_id',
          to: 'categories.id',
        },
      },
    }
  }
}

export default Expense

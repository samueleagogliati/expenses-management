import { Model } from 'objection'
import Expense from './expense.js'

class Category extends Model {
  static get tableName() {
    return 'categories'
  }

  static get relationMappings() {
    return {
      expenses: {
        relation: Model.HasManyRelation,
        modelClass: Expense,
        join: {
          from: 'categories.id',
          to: 'expenses.category_id',
        },
      },
    }
  }
}
export default Category

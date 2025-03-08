import { Model } from 'objection'

class Note extends Model {
  static get tableName() {
    return 'notes'
  }
}
export default Note

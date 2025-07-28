import { Model } from 'objection'

class GroupUser extends Model {
  static get tableName() {
    return 'group_users'
  }
}
export default GroupUser

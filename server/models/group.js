import { Model } from 'objection'
import User from './user.js'

class Group extends Model {
  static get tableName() {
    return 'groups'
  }

  static get relationMappings() {
    return {
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'groups.id',
          through: {
            from: 'group_users.group_id',
            to: 'group_users.user_id',
          },
          to: 'users.id',
        },
      },
    }
  }
}
export default Group

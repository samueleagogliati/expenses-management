import { Model } from 'objection'
import bcrypt from 'bcryptjs'
import Group from './group.js'

class User extends Model {
  static get tableName() {
    return 'users'
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 10)
  }

  async verifyPassword(password) {
    return bcrypt.compare(password, this.password)
  }

  static get relationMappings() {
    return {
      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: Group,
        join: {
          from: 'users.id',
          through: {
            from: 'group_users.user_id',
            to: 'group_users.group_id',
          },
          to: 'groups.id',
        },
      },
    }
  }
}
export default User

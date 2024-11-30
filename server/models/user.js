import { Model } from 'objection'
import bcrypt from 'bcrypt'

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

}
export default User
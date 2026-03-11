import User from '../models/user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default {
  async login({ username, password }) {
    const user = await User.query().findOne({ username })
    if (!user || !(await user.verifyPassword(password))) {
      throw new Error('Credenziali non valide')
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      'sassasamu',
      { expiresIn: '1y' },
    )
    return { success: true, token }
  },

  async signup({ firstname, lastname, username, email, password }) {
    if (await User.query().findOne({ username })) {
      throw new Error('Username già in uso')
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.query().insert({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
    })
    return {
      message: 'Utente registrato con successo',
      user: newUser,
      success: true,
    }
  },

  async getUser({ id }) {
    const user = await User.query()
      .findById(id)
      .withGraphFetched('groups')
      .modifyGraph('groups', (builder) => {
        builder.select('groups.id', 'name')
      })
    if (!user) throw new Error('Utente non trovato')
    return user
  },

  async list() {
    return await User.query()
  },
}

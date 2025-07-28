import Group from '../models/group.js'

export default {
  async list(params) {
    const userId = params.user_id
    return await Group.query()
      .innerJoinRelated('users')
      .where('users.id', userId)
      .select('groups.name')
  },

  async deleteGroup({ id }) {
    try {
      const deletedCount = await Note.query().deleteById(id)

      if (deletedCount === 0) {
        throw new Error('Grouppo non trovato')
      }

      return { status: 200, message: 'Gruppo eliminato' }
    } catch (error) {
      return { status: 500, message: 'Errore: ' + error.message }
    }
  },
}

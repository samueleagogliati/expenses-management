export async function up(knex) {
  return knex.schema.createTable('group_users', (table) => {
    table.increments('id').primary()

    table
      .integer('group_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('groups')
      .onDelete('CASCADE')

    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')

    table.unique(['group_id', 'user_id'])
    table.timestamps(true, true)
  })
}

export async function down(knex) {
  return knex.schema.dropTable('group_users')
}

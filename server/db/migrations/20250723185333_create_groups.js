export function up(knex) {
  return knex.schema.createTable('groups', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.timestamps(true, true)
  })
}

export function down(knex) {
  return knex.schema.dropTable('groups')
}

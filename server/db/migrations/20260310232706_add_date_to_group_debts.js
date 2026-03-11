export function up(knex) {
  return knex.schema.table('group_debts', function (table) {
    // Aggiunge la colonna 'date' di tipo data
    table.date('date')
  })
}

export function down(knex) {
  return knex.schema.table('group_debts', function (table) {
    // Rimuove la colonna 'date' in caso di rollback
    table.dropColumn('date')
  })
}

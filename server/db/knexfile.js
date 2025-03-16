// const knexConfig = {
//   client: 'mysql2',
//   connection: {
//     host: 'expenses-server',
//     user: 'root',
//     password: 'sassa',
//     database: 'expenses_management',
//   },
// }
// export default knexConfig

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sassa',
    database: process.env.DB_NAME || 'expenses_management',
    port: process.env.DB_PORT || 3306,
  },
}

export default knexConfig

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sassa',
    database: process.env.DB_NAME || 'expenses_management',
    port: process.env.DB_PORT || 3306,
  },
}

export default knexConfig

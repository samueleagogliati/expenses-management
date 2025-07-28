import dotenv from 'dotenv'
dotenv.config()

const knexConfig = {
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
  },
  migrations: {
    directory: './migrations',
  },
}

export default knexConfig

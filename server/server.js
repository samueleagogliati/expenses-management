import express from 'express'
import router from './routes/routes.js'
import serviceRouter from './routes/service.js'
import bodyParser from 'body-parser'
import cors from 'cors'
import Knex from 'knex'
import { Model } from 'objection'
import knexConfig from './db/knexfile.js'

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const knex = Knex(knexConfig)
Model.knex(knex)

knex
  .raw('SELECT 1+1 as result')
  .then(() => {
    console.log('Connessione al database riuscita.')
  })
  .catch((err) => {
    console.error('Errore di connessione al database:', err)
  })

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://192.168.1.30:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
)
app.options('*', cors())

const PORT = process.env.PORT || 5001

app.use('/', router)

app.use('/service', serviceRouter)

app.use('/exports', express.static(path.join(__dirname, 'services', 'exports')))

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`)
})

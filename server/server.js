import express from "express"
import router from "./routes/routes.js"
import serviceRouter from "./routes/service.js"
import bodyParser from "body-parser"
import cors from "cors"
import Knex from "knex"
import { Model } from "objection"
import knexConfig from "./db/knexfile.js"

const knex = Knex(knexConfig)
Model.knex(knex)

knex
  .raw("SELECT 1+1 as result")
  .then(() => {
    console.log("Connessione al database riuscita.")
  })
  .catch((err) => {
    console.error("Errore di connessione al database:", err)
  })

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.options('*', cors())

const PORT = process.env.PORT || 5001

app.use("/", router)

app.use("/service", serviceRouter)

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
})

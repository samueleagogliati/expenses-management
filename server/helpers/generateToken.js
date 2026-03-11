import dotenv from 'dotenv'
dotenv.config()

import jwt from 'jsonwebtoken'

const payload = {
  id: 1,
  username: 'admin',
  language: 'it',
}

const secret = process.env.JWT_SECRET
const expiresIn = '10y'

const token = jwt.sign(payload, secret, { expiresIn })

console.log(token)

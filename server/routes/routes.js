import { Router } from 'express'
const router = Router()
import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.query().findOne({ username: username })
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' })
    }
    const isValidPassword = await user.verifyPassword(password)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenziali non valide' })
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      'sassasamu',
      { expiresIn: '1d' },
    )
    res.json({ success: true, token: token })
  } catch (error) {
    console.error('Errore durante il login:', error)
    res.status(500).json({ message: 'Errore durante il login' })
  }
})

router.post('/signup', async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body
  try {
    const existingUser = await User.query().findOne({ username: username })
    if (existingUser) {
      return res.status(400).json({ message: 'Username già in uso' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.query().insert({
      firstname: firstname,
      lastname: lastname,
      username: username,
      email: email,
      password: hashedPassword,
    })

    res
      .status(201)
      .json({ message: 'Utente registrato con successo', user: newUser })
  } catch (error) {
    console.error("Errore durante la registrazione dell'utente:", error)
    res
      .status(500)
      .json({ message: "Errore durante la registrazione dell'utente" })
  }
})

export default router

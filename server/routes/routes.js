import { Router } from "express"
const router = Router()
import Expense from "../models/expense.js"
import Category from "../models/category.js"
import jwt from "jsonwebtoken"
import User from "../models/user.js"
import bcrypt from "bcrypt"

router.post("/login", async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.query().findOne({ username: username })
    if (!user) {
      return res.status(401).json({ message: "Credenziali non valide" })
    }
    const isValidPassword = await user.verifyPassword(password)

    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenziali non valide" })
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      "sassasamu",
      { expiresIn: "60m" },
    )
    res.json({ success: true, token: token })
  } catch (error) {
    console.error("Errore durante il login:", error)
    res.status(500).json({ message: "Errore durante il login" })
  }
})

router.post("/signup", async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body
  try {
    const existingUser = await User.query().findOne({ username: username })
    if (existingUser) {
      return res.status(400).json({ message: "Username già in uso" })
    }

    // Crea un nuovo utente con la password criptata
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
      .json({ message: "Utente registrato con successo", user: newUser })
  } catch (error) {
    console.error("Errore durante la registrazione dell'utente:", error)
    res
      .status(500)
      .json({ message: "Errore durante la registrazione dell'utente" })
  }
})

// USERS
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.query().findById(id)

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" })
    }
    res.json(user)
  } catch (error) {
    console.error("Errore durante il recupero dell'utente:", error)
    res.status(500).json({ error: "Errore durante il recupero dell'utente" })
  }
})
// END USERS

// EXPENSES

router.post("/expenses_of_day", async (req, res) => {
  let selectedDate = req.body.selectedDate
  let userId = req.body.userId
  const expenses = await Expense.query()
    .withGraphFetched("category")
    .where("date", new Date(selectedDate))
    .andWhere("user_id", userId)
  res.json(expenses)
})

router.post("/all_expenses", async (req, res) => {
  let { user_id, month, year } = req.body
  let query = Expense.query()
    .withGraphFetched("category")
    .where("user_id", user_id)
  if (month !== null && year !== null) {
    // Estrarre il mese e l'anno dalla data
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // Filtrare per data
    query = query.whereBetween("date", [startDate, endDate])
  }
  const expenses = await query
  res.json(expenses)
})

router.post("/saveExpense", async (req, res) => {
  try {
    let { category_id, description, price, date, user_id } = req.body
    date = new Date(date)
    let newExpense = await Expense.saveData({
      category_id,
      description,
      price,
      date,
      user_id,
    })
    res.json({ message: "Expense saved successfully", expense: newExpense })
  } catch (error) {
    console.error("Error saving expense:", error)
    res.status(500).json({ error: "Error saving expense" })
  }
})

router.put("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { category_id, description, price } = req.body

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: "Expense ID must be a valid number" })
    }
    // Verifica che l'expense esista nel database
    const existingExpense = await Expense.query().findById(id)
    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" })
    }
    const updatedExpense = await Expense.query().patchAndFetchById(id, {
      category_id,
      description,
      price,
    })

    res.json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    })
  } catch (error) {
    console.error("Error updating expense:", error)
    res.status(500).json({ error: "Error updating expense" })
  }
})

router.delete("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params
    const message = await Expense.deleteExpense(id)
    res.json({ message: message })
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'expense:", error)
    res
      .status(500)
      .json({ error: "Errore durante l'eliminazione dell'expense" })
  }
})

router.post("/expenses", async (req, res) => {
  try {
    const { year, month, userId } = req.body

    if (isNaN(year) || isNaN(month)) {
      return res
        .status(400)
        .json({ error: "Year and month must be valid numbers" })
    }

    const yearInt = parseInt(year)
    const monthInt = parseInt(month)

    const total = await Expense.getTotalExpensesByMonthAndYearAndUser(
      monthInt,
      yearInt,
      userId,
    )

    res.json(total)
  } catch (error) {
    console.error("Errore durante il recupero delle spese:", error)
    res.status(500).json({ error: "Errore durante il recupero delle spese" })
  }
})

router.post("/expenses_of_days", async (req, res) => {
  try {
    const { year, month, userId } = req.body

    if (isNaN(year) || isNaN(month)) {
      return res
        .status(400)
        .json({ error: "Year and month must be valid numbers" })
    }

    const yearInt = parseInt(year)
    const monthInt = parseInt(month)

    const expenses = await Expense.getExpensesByDayAndUser(
      monthInt,
      yearInt,
      userId,
    )

    res.json(expenses)
  } catch (error) {
    console.error("Errore durante il recupero delle spese:", error)
    res.status(500).json({ error: "Errore durante il recupero delle spese" })
  }
})

router.post("/expenses_by_category", async (req, res) => {
  try {
    const { month, year, userId } = req.body

    let query = Category.query()
      .leftJoinRelated("expenses")
      .where("expenses.user_id", userId)
      .select("categories.id as category_id", "categories.description")
      .sum("expenses.price as total")
      .groupBy("categories.id", "categories.description")
      .orderBy("categories.description", "asc")

    if (month !== null && year !== null) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      query = query.whereBetween("date", [startDate, endDate])
    }

    let expensesByCategory = await query

    expensesByCategory = expensesByCategory.map((category) => {
      return {
        ...category,
        total: category.total || 0,
      }
    })

    res.json(expensesByCategory)
  } catch (error) {
    console.error(
      "Errore durante il recupero delle spese raggruppate per categoria:",
      error,
    )
    res.status(500).json({
      error: "Errore durante il recupero delle spese raggruppate per categoria",
    })
  }
})
// END EXPENSES

// CATEGORIES
router.get("/categories", async (req, res) => {
  const categories = await Category.query()
  res.json(categories)
})
// END CATEGORIES

export default router

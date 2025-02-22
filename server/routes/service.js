import { Router } from "express"
import callService from "../helpers/callService.js"

const router = Router()

router.post("/", async (req, res) => {
  try {
    const { serviceAction, params } = req.body
    const result = await callService(serviceAction, params)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

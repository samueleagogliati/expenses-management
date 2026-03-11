import { Router } from 'express'
import callService from '../helpers/callService.js'
import { authenticateJWT } from '../helpers/authenticateJWT.js'

const router = Router()

router.post('/:serviceAction', async (req, res) => {
  const { serviceAction } = req.params
  const privateActions = []

  try {
    if (privateActions.includes(serviceAction)) {
      await new Promise((resolve, reject) => {
        authenticateJWT(req, res, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }

    const params = req.body
    const result = await callService(serviceAction, params, req.user)
    res.json(result)
  } catch (error) {
    res
      .status(error.status || 401)
      .json({ message: error.message || 'Unauthorized' })
  }
})

export default router

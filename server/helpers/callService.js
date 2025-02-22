import userService from '../services/userService.js'
import expenseService from '../services/expenseService.js'
import categoryService from '../services/categoryService.js'

const services = {
  users: userService,
  expenses: expenseService,
  categories: categoryService,
}

const callService = async (serviceAction, params) => {
  try {
    const [serviceName, action] = serviceAction.split('.')
    if (!services[serviceName])
      throw new Error(`Service ${serviceName} not found`)
    if (!services[serviceName][action])
      throw new Error(`Action ${action} not found in ${serviceName}`)

    return await services[serviceName][action](params)
  } catch (error) {
    console.error('Error in callService:', error)
    throw error
  }
}

export default callService

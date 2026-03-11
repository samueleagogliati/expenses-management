import userService from '../services/userService.js'
import expenseService from '../services/expenseService.js'
import categoryService from '../services/categoryService.js'
import exportData from '../services/exportData.js'
import GroupDebtService from '../services/groupDebtService.js'
import noteService from '../services/noteService.js'
import groupService from '../services/groupService.js'

const services = {
  users: userService,
  expenses: expenseService,
  categories: categoryService,
  exportData: exportData,
  groupDebts: GroupDebtService,
  notes: noteService,
  groups: groupService,
}

const callService = async (serviceAction, params) => {
  try {
    const [serviceName, action] = serviceAction.split('.')
    if (!services[serviceName])
      return {
        success: false,
        message: `Service ${serviceName} not found`,
      }
    if (!services[serviceName][action])
      return {
        success: false,
        message: `Action ${action} not found in ${serviceName}`,
      }

    return await services[serviceName][action](params)
  } catch (error) {
    console.error('Error in callService:', error)
    throw error
  }
}

export default callService

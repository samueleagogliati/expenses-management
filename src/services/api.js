import axios from 'axios'

const callService = async (serviceAction, params) => {
  try {
    const response = await axios.post('http://expenses-server:5001/service', {
      serviceAction,
      params,
    })
    return response.data
  } catch (error) {
    console.error('Errore nel callService:', error)
    throw error
  }
}

export default callService

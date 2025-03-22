import axios from 'axios'

const callService = async (serviceAction, params) => {
  try {
    const response = await axios.post('/api/service', {
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

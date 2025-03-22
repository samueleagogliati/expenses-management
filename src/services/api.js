import axios from 'axios'

const callService = async (serviceAction, params) => {
  try {
    const response = await axios.post('http://172.18.0.3:5001/service', {
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

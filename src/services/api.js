import axios from 'axios'

const callService = async (serviceAction, params) => {
  try {
    const token = localStorage.getItem('jwt_token')
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await axios.post(
      `http://192.168.1.30:5001/service/${serviceAction}`,
      params,
      { headers },
    )
    return response.data
  } catch (error) {
    console.error('Error in callService:', error)
    throw error
  }
}

export default callService

import axios from 'axios'

const callService = async (serviceAction, params) => {
  try {
    const token = localStorage.getItem('token')?.replace(/^Bearer\s*/i, '')
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || '/service'}/${serviceAction}`,
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

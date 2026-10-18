import { jwtDecode } from 'jwt-decode'

export function getValidToken() {
  const token = localStorage.getItem('token')?.replace(/^Bearer\s*/i, '')
  if (!token) return null

  try {
    const { exp } = jwtDecode(token)
    if (typeof exp === 'number' && exp > Date.now() / 1000) return token
  } catch {
    // Invalid or expired tokens are removed below.
  }

  localStorage.removeItem('token')
  return null
}

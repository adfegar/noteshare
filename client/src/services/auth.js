import { jwtDecode } from 'jwt-decode'
import { API_PREFIX } from '../consts'
import Cookies from 'js-cookie'
import { instance } from './interceptors'

export async function registerUser (user) {
  if (user) {
    const registerResult = await instance.post(`${API_PREFIX}/auth/register`, user)

    if (registerResult.status === 200) {
      const registerResponse = await registerResult.data
      return registerResponse
    } else {
      const error = await registerResult.data
      throw new Error(error.error)
    }
  }
}

export async function authenticateUser (user) {
  if (user) {
    const authenticateResult = await instance.post(`${API_PREFIX}/auth/authenticate`, user)

    if (authenticateResult.status === 200) {
      const authResponse = await authenticateResult.data
      return authResponse
    } else {
      const error = await authenticateResult.data
      throw new Error(error.error)
    }
  }
}

export async function refreshUserToken ({ refreshToken }) {
  const refreshTokenResult = await instance.post(`${API_PREFIX}/auth/refresh-token`, refreshToken)

  if (refreshTokenResult.status === 200) {
    const refreshResponse = await refreshTokenResult.data
    Cookies.set('access-token', refreshResponse.token, { expires: 365 })
  } else {
    const error = await refreshTokenResult.data
    throw new Error(error.error)
  }
}

export async function checkTokenExp ({ token }) {
  const decodedToken = jwtDecode(token)
  if (Date.now() >= decodedToken.exp * 1000) {
    await refreshUserToken({ refreshToken: Cookies.get('refresh-token') })
  }
}

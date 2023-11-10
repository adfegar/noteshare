import { jwtDecode } from 'jwt-decode'
import { API_PREFIX } from '../consts'
import Cookies from 'js-cookie'

export async function registerUser (user) {
  if (user) {
    const registerResult = await fetch(`${API_PREFIX}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })

    if (registerResult.status === 200) {
      const registerResponse = await registerResult.json()
      return registerResponse
    } else {
      const error = await registerResult.json()
      throw new Error(error.error)
    }
  }
}

export async function authenticateUser (user) {
  if (user) {
    const authenticateResult = await fetch(`${API_PREFIX}/auth/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })

    if (authenticateResult.status === 200) {
      const authResponse = await authenticateResult.json()
      return authResponse
    } else {
      const error = await authenticateResult.json()
      throw new Error(error.error)
    }
  }
}

export async function refreshUserToken ({ refreshToken }) {
  const refreshTokenResult = await fetch(`${API_PREFIX}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    })
  })

  if (refreshTokenResult.status === 200) {
    const refreshResponse = await refreshTokenResult.json()
    Cookies.set('access-token', refreshResponse.token, { expires: 365 })
  } else {
    const error = await refreshTokenResult.json()
    throw new Error(error.error)
  }
}

export async function checkTokenExp ({ token }) {
  const decodedToken = jwtDecode(token)
  if (Date.now() >= decodedToken.exp * 1000) {
    await refreshUserToken({ refreshToken: Cookies.get('refresh-token') })
  }
}

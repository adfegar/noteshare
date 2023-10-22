import { API_PREFIX } from '../consts'

export async function registerUser (user) {
  if (user) {
    const registerResult = await fetch(`${API_PREFIX}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })

    return registerResult
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

    return authenticateResult
  }
}

export async function refreshUserToken ({ refreshToken }) {
  const refreshTokenResult = await fetch(`${API_PREFIX}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(refreshToken)
  })

  return refreshTokenResult.json()
}

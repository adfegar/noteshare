import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'

export async function getUserByEmail ({ email }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const userResult = await fetch(`${API_PREFIX}/users/${email}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  if (userResult.status === 200) {
    const user = await userResult.json()
    return user
  } else {
    const error = await userResult.json()
    throw new Error(error.error)
  }
}

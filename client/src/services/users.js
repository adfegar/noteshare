import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'

export async function getUserByEmail ({ email }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const result = await fetch(`${API_PREFIX}/users/${email}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  return result
}

import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'

export async function getUserByEmail ({ email }) {
  const result = await fetch(`${API_PREFIX}/users/${email}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  return result
}


import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'
import { instance } from './interceptors'

export async function getUserByEmail ({ email }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const userResult = await instance.get(`${API_PREFIX}/users/${email}`)

  if (userResult.status === 200) {
    const user = userResult.data
    return user
  } else {
    const error = userResult.data
    throw new Error(error.error)
  }
}

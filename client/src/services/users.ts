import { API_PREFIX } from '../consts'
import { instance } from './interceptors'
import { User } from '../@types/user'
import { APIError } from '../@types/api'

export async function getUserByEmail (email: string): Promise<User> {
  const userResult: {data: User|APIError, status: Number}
    = await instance.get(`${API_PREFIX}/users/${email}`)

  if (userResult.status !== 200) {
    const error = <APIError> userResult.data
    throw new Error(error.error)
  }
  const user = <User> userResult.data
  return user
}


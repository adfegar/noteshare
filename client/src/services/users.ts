import { API_PREFIX } from '../consts'
import { instance } from './interceptors'
import { type User } from '../@types/user'
import { type APIError } from '../@types/api'

export async function getUserByEmail (email: string): Promise<User> {
  const userResult: { data: User | APIError, status: number } =
    await instance.get(`${API_PREFIX}/users/${email}`)

  if (userResult.status !== 200) {
    const error = userResult.data as APIError
    throw new Error(error.error)
  }
  const user = userResult.data as User
  return user
}

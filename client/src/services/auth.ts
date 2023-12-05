import { jwtDecode } from 'jwt-decode'
import { API_PREFIX } from '../consts'
import Cookies from 'js-cookie'
import { instance } from './interceptors'
import { type AuthenticateUserRequest, type RefreshTokenRequest, type RefreshTokenResponse, type RegisterUserRequest, type AuthResponse } from '../@types/auth'
import { type APIError } from '../@types/api'

export async function registerUser (request: RegisterUserRequest): Promise<AuthResponse> {
  const registerResult: { data: AuthResponse | APIError, status: number } =
        await instance.post(`${API_PREFIX}/auth/register`, request)

  if (registerResult.status !== 200) {
    const error = registerResult.data as APIError
    throw new Error(error.error)
  }
  const registerResponse = registerResult.data as AuthResponse
  return registerResponse
}

export async function authenticateUser (request: AuthenticateUserRequest): Promise<AuthResponse> {
  const authenticateResult: { data: AuthResponse | APIError, status: number } =
        await instance.post(`${API_PREFIX}/auth/authenticate`, request)

  if (authenticateResult.status !== 200) {
    const error = authenticateResult.data as APIError
    throw new Error(error.error)
  }
  const authResponse = authenticateResult.data as AuthResponse
  return authResponse
}

export async function refreshUserToken (request: RefreshTokenRequest): Promise<void> {
  const refreshTokenResult: { data: RefreshTokenResponse | APIError, status: number } =
    await instance.post(`${API_PREFIX}/auth/refresh-token`, request)

  if (refreshTokenResult.status !== 200) {
    const error = refreshTokenResult.data as APIError
    throw new Error(error.error)
  }
  const refreshResponse = refreshTokenResult.data as RefreshTokenResponse
  Cookies.set('access-token', refreshResponse.refresh_token, { expires: 365 })
}

export async function checkTokenExp (token: string): Promise<void> {
  const decodedToken = jwtDecode(token)
  const refreshToken = Cookies.get('refresh_token')
  if (refreshToken !== undefined && decodedToken.exp !== undefined && Date.now() >= decodedToken.exp * 1000) {
    await refreshUserToken({ refresh_token: refreshToken })
  }
}

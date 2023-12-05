export interface RegisterUserRequest {
  username: string
  email: string
  password: string
}

export interface AuthenticateUserRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
}

export interface RefreshTokenResponse {
  refresh_token: string
}

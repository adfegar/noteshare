export interface UserData {
  accessToken?: string | undefined
  refreshToken?: string | undefined
  userId?: number | undefined
  username?: string | undefined
}

export interface UserDataContext {
  userData: UserData
  setUserData: React.Dispatch<React.SetStateAction<UserData>>
}

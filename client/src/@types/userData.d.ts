export interface UserData {
  accessToken?: string | undefined
  refreshToken?: string | undefined
  userId?: string | undefined
  username?: string | undefined
}

export interface UserDataContext {
  userData: UserData
  setUserData: React.Dispatch<React.SetStateAction<UserData>>
}


export interface UserData {
    accessToken: string|undefined
    refreshToken: string
    userId: string
    username: string 
}

export type UserDataContext = {
    userData: UserData,
    setUserData: React.Dispatch<React.SetStateAction<UserData>>
}

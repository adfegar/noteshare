import { useState, createContext, type ReactNode } from 'react'
import { type UserData, type UserDataContext } from '../@types/userData'
import Cookies from 'js-cookie'

export const UserContext = createContext<UserDataContext | null>(null)

interface UserDataProviderProps {
  children: ReactNode
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
    accessToken: Cookies.get('access_token'),
    refreshToken: Cookies.get('refresh_token'),
    userId: Number(Cookies.get('user_id')),
    username: Cookies.get('username')
  })

  return (
        <UserContext.Provider
            value={{
              userData,
              setUserData
            }}
        >
            {children}
       </UserContext.Provider>
  )
}

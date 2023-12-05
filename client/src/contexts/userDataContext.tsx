import { useState, createContext, ReactNode } from 'react'
import { UserData, UserDataContext } from '../@types/userData'
import Cookies from 'js-cookie'

export const UserContext = createContext<UserDataContext|null>(null)

export function UserDataProvider ({ children }: {children: ReactNode}) {
  const [userData, setUserData] = useState<UserData>({
    accessToken: Cookies.get('access_token')!,
    refreshToken: Cookies.get('refresh_token')!,
    userId: Cookies.get('user_id')!,
    username: Cookies.get('username')!
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


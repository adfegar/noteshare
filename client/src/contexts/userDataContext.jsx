import { useState, createContext } from 'react'
import Cookies from 'js-cookie'

export const UserDataContext = createContext()

export function UserDataProvider ({ children }) {
  const [userData, setUserData] = useState({
    accessToken: Cookies.get('access-token'),
    refreshToken: Cookies.get('refresh-token'),
    userId: Cookies.get('userid'),
    username: Cookies.get('username'),
    rooms: []
  })

  return (
        <UserDataContext.Provider
                value={{
                  userData,
                  setUserData
                }}
        >
            {children}
       </UserDataContext.Provider>
  )
}

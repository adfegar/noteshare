import { useState } from "react";
import { createContext } from "react";
import Cookies from "js-cookie"

export const UserDataContext = createContext()

export function UserDataProvider ({children}) {
    const [userData, setUserData] = useState({
        accessToken: Cookies.get("access-token"),
        refreshToken: Cookies.get("refresh-token") 
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

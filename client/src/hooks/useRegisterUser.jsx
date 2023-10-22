import { useEffect } from "react";
import { useState } from "react";
import { registerUser } from "../services/auth";

export function useRegisterUser({request}) {
   const [user, setUser] = useState()

    useEffect(() => {
        registerUser({request}).then(response => setUser(response))
    }, [])
    
    return {user}
}

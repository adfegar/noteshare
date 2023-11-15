import { useEffect, useState } from 'react'
import { getUserRooms } from '../services/rooms'

export function useUserRooms ({ userId }) {
  const [userRooms, setUserRooms] = useState([])

  useEffect(() => {
    getUserRooms({ userId })
      .then(response => {
        setUserRooms(response)
      })
      .catch(err => {
        setUserRooms([])
        console.error(err)
      })
  }, [])

  return { userRooms, setUserRooms }
}

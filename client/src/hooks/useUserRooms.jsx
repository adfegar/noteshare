import { useEffect, useState } from 'react'
import { getUserRooms } from '../services/rooms'

export function useUserRooms ({ userId }) {
  const [userRooms, setUserRooms] = useState()

  useEffect(() => {
    getUserRooms({ userId }).then(response => {
      if (response === 200) {
        response.json().then(responseRooms => {
          setUserRooms(responseRooms)
        })
      }
    })
  }, [])

  return { userRooms }
}

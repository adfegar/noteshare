import { useEffect, useState } from 'react'
import { getUserRooms } from '../services/rooms'

export function useUserRooms ({ userId }) {
  const [rooms, setRooms] = useState()

  useEffect(() => {
    getUserRooms({ userId }).then(response => {
      if (response === 200) {
        response.json().then(responseRooms => {
          setRooms(responseRooms)
        })
      }
    })
  }, [])

  return { rooms }
}

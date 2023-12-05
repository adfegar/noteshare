import { useEffect, useState } from 'react'
import { getUserRooms } from '../services/rooms'
import { Room } from '../@types/room'

interface UseUserRoomsResult {
   userRooms: Room[],
   setUserRooms: React.Dispatch<React.SetStateAction<Room[]>>
}

export function useUserRooms (userId: number): UseUserRoomsResult {
  const [userRooms, setUserRooms] = useState<Room[]>([])

  useEffect(() => {
    getUserRooms(userId)
      .then(response => {
        if (response != null) {
          setUserRooms(response)
        } else {
          setUserRooms([])
        }
      })
      .catch(err => {
        setUserRooms([])
        console.error(err)
      })
  }, [])

  return { userRooms, setUserRooms }
}


import { useEffect, useState } from 'react'
import { getRoomUsers } from '../services/rooms'
import { User } from '../@types/user'

interface UseRoomUsersResult {
    roomUsers: User[]
}

export function useRoomUsers (roomId: number): UseRoomUsersResult {
  const [roomUsers, setRoomUsers] = useState<User[]>([])

  useEffect(() => {
    getRoomUsers(roomId)
      .then(roomUsers => {
        setRoomUsers(roomUsers)
      })
      .catch(err => {
        setRoomUsers([])
        console.error(err)
      })
  }, [roomId])

  return { roomUsers }
}


import { useEffect, useState } from 'react'
import { getRoomUsers } from '../services/rooms'

export function useRoomUsers ({ roomId }) {
  const [roomUsers, setRoomUsers] = useState([])

  useEffect(() => {
    getRoomUsers({ roomId }).then(roomUsers => {
      if (roomUsers != null) {
        setRoomUsers(roomUsers)
      }
    })
  }, [roomId])

  return { roomUsers }
}

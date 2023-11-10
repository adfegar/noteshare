import { useEffect, useState } from 'react'
import { getRoomUsers } from '../services/rooms'

export function useRoomUsers ({ roomId }) {
  const [roomUsers, setRoomUsers] = useState([])

  useEffect(() => {
    getRoomUsers({ roomId })
      .then(roomUsers => {
        setRoomUsers(roomUsers)
      })
      .catch(err => console.error(err))
  }, [roomId])

  return { roomUsers }
}

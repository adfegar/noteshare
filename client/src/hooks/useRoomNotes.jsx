import { useEffect, useState } from 'react'
import { getRoomNotes } from '../services/rooms'

export function useRoomNotes ({ roomId }) {
  const [roomNotes, setRoomNotes] = useState([])

  useEffect(() => {
    getRoomNotes({ roomId }).then(roomNotesResult => {
      setRoomNotes(roomNotesResult)
    })
  }, [roomId])

  return { roomNotes }
}

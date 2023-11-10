import { useEffect, useState } from 'react'
import { getRoomNotes } from '../services/rooms'

export function useRoomNotes ({ roomId }) {
  const [roomNotes, setRoomNotes] = useState([])

  useEffect(() => {
    if (roomId) {
      getRoomNotes({ roomId })
        .then(roomNotesResult => {
          setRoomNotes(roomNotesResult)
        })
        .catch(err => console.error(err))
    }
  }, [roomId])

  return { roomNotes, setRoomNotes }
}

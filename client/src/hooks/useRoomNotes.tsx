import { useEffect, useState } from 'react'
import { getRoomNotes } from '../services/rooms'
import { Note } from '../@types/note'

interface UserRoomNotesResult {
    roomNotes: Note[]
    setRoomNotes: React.Dispatch<React.SetStateAction<Note[]>>
}

export function useRoomNotes (roomId: number): UserRoomNotesResult {
  const [roomNotes, setRoomNotes] = useState<Note[]>([])

  useEffect((): void => {
    if (roomId) {
      getRoomNotes(roomId)
        .then(roomNotesResult => {
          setRoomNotes(roomNotesResult)
        })
        .catch(err => {
          setRoomNotes([])
          console.error(err)
        })
    }
  }, [roomId])

  return { roomNotes, setRoomNotes }
}


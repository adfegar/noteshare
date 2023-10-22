import { useEffect, useState } from 'react'
import { getUserNotes } from '../services/notes'

export function useUserNotes () {
  const [userNotes, setUserNotes] = useState()

  useEffect(() => {
    getUserNotes().then(result => {
      if (result.status === 200) {
        result.json().then(notes => {
          setUserNotes(notes)
        })
      }
    })
  }, [])

  return { userNotes }
}

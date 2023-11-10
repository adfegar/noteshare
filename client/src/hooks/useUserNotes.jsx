import { useEffect, useState } from 'react'
import { getUserNotes } from '../services/notes'

export function useUserNotes () {
  const [userNotes, setUserNotes] = useState([])

  useEffect(() => {
    getUserNotes()
      .then(result => {
        setUserNotes(result)
      })
      .catch(err => console.error(err))
  }, [])

  return { userNotes }
}

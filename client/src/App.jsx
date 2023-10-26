import { Navigate } from 'react-router-dom'
import './App.css'
import { UserDataContext } from './contexts/userDataContext'
import { useContext, useEffect, useState } from 'react'
import { useUserNotes } from './hooks/useUserNotes'
import { joinRoom, sendMessage, ws } from './services/ws'
import { addUserNote } from './services/notes'

function App () {
  const { userData } = useContext(UserDataContext)
  const { userNotes } = useUserNotes()
  const [receivedNotes, setReceivedNotes] = useState([])

  useEffect(() => {
    ws.addEventListener('open', () => {
      console.log('Connected to ws')
    })
    ws.addEventListener('close', () => {
      console.log('Connection closed')
    })
    ws.addEventListener('message', (event) => {
      const note = JSON.parse(event.data)
      // generate a random id just for React key
      note.id = crypto.randomUUID()
      const updatedReceivedNotes = [...receivedNotes, note]
      setReceivedNotes(updatedReceivedNotes)
    })
  }, [])

  if (!userData?.accessToken) {
    return (
            <Navigate to="/login" replace={true}/>
    )
  } else {
    return (

        <>
            <header>
            </header>

            <article id='notesRoot'>
            {
                (userNotes.length > 0 || receivedNotes.length > 0)
                  ? userNotes.concat(receivedNotes).map(note =>
                    <p key={note.id}>{note.content}</p>
                  )
                  : <p>{'No notes where found'}</p>
            }
            <form
                onSubmit={(event) => {
                  event.preventDefault()
                  const formFields = Object.fromEntries(new FormData(event.target))
                  joinRoom(formFields.room)
                }}
            >
                <input type='text' name='room'/>
                <button type='submit'/>
        </form>
        <form
                onSubmit={(event) => {
                  event.preventDefault()
                  const formFields = Object.fromEntries(new FormData(event.target))
                  const note = {
                    content: formFields.message
                  }
                  sendMessage(note)
                  addUserNote(note)
                }}
            >
                <input type='text' name='message'/>
                <button type='submit'/>
        </form>

            </article>
        </>
    )
  }
}
export default App

import { Navigate } from 'react-router-dom'
import './App.css'
import { UserDataContext } from './contexts/userDataContext'
import { useContext } from 'react'
import { useUserNotes } from './hooks/useUserNotes'
import { addUserNote } from './services/notes'
import { useWS } from './hooks/useWS'
import { NoteList } from './components/NoteList'

function App () {
  const { userData } = useContext(UserDataContext)
  const { userNotes } = useUserNotes()
  const { receivedNotes, joinRoom, sendMessage } = useWS()

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
                  ? <NoteList userNotes={userNotes.concat(receivedNotes)} />
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

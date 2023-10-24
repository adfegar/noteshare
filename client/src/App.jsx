import { Navigate } from 'react-router-dom'
import './App.css'
import { UserDataContext } from './contexts/userDataContext'
import { useContext } from 'react'
import { useUserNotes } from './hooks/useUserNotes'
import { ws } from './services/ws'
function App () {
  const { userData } = useContext(UserDataContext)
  const { userNotes } = useUserNotes()

  if (!userData?.accessToken) {
    return (
            <Navigate to="/login" replace={true}/>
    )
  } else {
    return (

        <>
            <header>
            </header>

            <article>
            {
                (userNotes && userNotes.length > 0)
                  ? userNotes.map(note =>
                    <p key={note.id}>{note.content}</p>
                  )
                  : <p>{'No notes where found'}</p>
            }
            <form
                onSubmit={(event) => {
                  event.preventDefault()
                  const formFields = Object.fromEntries(new FormData(event.target))
                  const message = {
                    action: 'join-room',
                    message: formFields.message
                  }
                  ws.send(JSON.stringify(message))
                }}
            >
                <input type='text' name='message'/>
                <button type='submit'/>
        </form>
        <form
                onSubmit={(event) => {
                  event.preventDefault()
                  const formFields = Object.fromEntries(new FormData(event.target))
                  const message = {
                    action: 'send-message',
                    message: formFields.message
                  }
                  ws.send(JSON.stringify(message))
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

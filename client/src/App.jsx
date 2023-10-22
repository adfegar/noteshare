import { Navigate } from 'react-router-dom'
import './App.css'
import { UserDataContext } from './contexts/userDataContext'
import { useContext } from 'react'
import { useUserNotes } from './hooks/useUserNotes'
import { addUserNote } from './services/notes'
import Cookies from 'js-cookie'

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
                  const note = {
                    content: formFields.content,
                    user_id: Number(Cookies.get('userid'))
                  }

                  addUserNote(note).then(result => {
                    result.text().then(error => console.log(error))
                  })
                }}
            >
                <input type='text' name='content'/>
                <button type='submit'/>
        </form>
            </article>
        </>
    )
  }
}
export default App

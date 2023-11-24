import { Navigate } from 'react-router-dom'
import './App.css'
import { UserDataContext } from './contexts/userDataContext'
import { useContext, useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Room } from './components/Room'
import Cookies from 'js-cookie'
import { useWS } from './hooks/useWS'

function App () {
  const { userData } = useContext(UserDataContext)
  const [currentRoom, setCurrentRoom] = useState()
  const {
    lastReceivedNote,
    lastEditedNote,
    lastDeletedNote,
    lastEditedRoom,
    lastDeletedRoom,
    sendNote,
    editNote,
    deleteNote,
    joinRoom,
    editRoom,
    deleteRoomWS
  } = useWS()

  useEffect(() => {
    if (!Cookies.get('authenticated')) {
      Cookies.set('authenticated', true)
    }
  }, [])

  return (
      <>
          {
            userData.accessToken && (Cookies.get('authenticated') === 'true')
              ? <main className='flex h-full'>
                    <Sidebar
                        joinRoom={joinRoom}
                        lastEditedRoom={lastEditedRoom}
                        lastDeletedRoom={lastDeletedRoom}
                        currentRoom={currentRoom}
                        currentRoomSetter={setCurrentRoom}
                     />
                    <Room
                        lastReceivedNote={lastReceivedNote}
                        lastEditedNote={lastEditedNote}
                        lastDeletedNote={lastDeletedNote}
                        lastEditedRoom={lastEditedRoom}
                        lastDeletedRoom={lastDeletedRoom}
                        sendNote={sendNote}
                        editNote={editNote}
                        deleteNote={deleteNote}
                        editRoom={editRoom}
                        deleteRoomWS={deleteRoomWS}
                        currentRoom={currentRoom}
                        setCurrentRoom={setCurrentRoom}
                    />
                </main>
              : <Navigate to="/login" replace={true}/>
          }
      </>
  )
}
export default App

import { Navigate } from 'react-router-dom'
import './App.css'
import { UserDataContext } from './contexts/userDataContext'
import { useContext, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Room } from './components/Room'

function App () {
  const { userData } = useContext(UserDataContext)
  const [currentRoom, setCurrentRoom] = useState()
  if (!userData?.accessToken) {
    return (
            <Navigate to="/login" replace={true}/>
    )
  } else {
    return (
        <>
            <main className='flex h-full'>
                <Sidebar currentRoom={currentRoom} currentRoomSetter={setCurrentRoom} />
                <Room currentRoom={currentRoom} setCurrentRoom={setCurrentRoom}/>
            </main>
        </>
    )
  }
}
export default App

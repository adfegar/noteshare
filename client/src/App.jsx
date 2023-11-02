import { Navigate } from 'react-router-dom'
import './App.css'
import { UserDataContext } from './contexts/userDataContext'
import { useContext, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
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
            <Header />
            <main className='flex h-full'>
                <Sidebar currentRoomSetter={setCurrentRoom} />
                <Room currentRoom={currentRoom}/>
            </main>
        </>
    )
  }
}
export default App

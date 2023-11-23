import { Navigate } from 'react-router-dom'
import './App.css'
import { UserDataContext } from './contexts/userDataContext'
import { useContext, useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Room } from './components/Room'
import Cookies from 'js-cookie'

function App () {
  const { userData } = useContext(UserDataContext)
  const [currentRoom, setCurrentRoom] = useState()

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
                    <Sidebar currentRoom={currentRoom} currentRoomSetter={setCurrentRoom}/>
                    <Room currentRoom={currentRoom} setCurrentRoom={setCurrentRoom}/>
                </main>
              : <Navigate to="/login" replace={true}/>
          }
      </>
  )
}
export default App

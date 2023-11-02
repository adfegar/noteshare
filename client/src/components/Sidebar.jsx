import { useUserRooms } from '../hooks/useUserRooms'
import Cookies from 'js-cookie'
import { useWS } from '../hooks/useWS'
import { addRoom, addUserToRoom, getRoomByInviteCode } from '../services/rooms'

export function Sidebar ({ currentRoomSetter }) {
  const { userRooms, setUserRooms } = useUserRooms({ userId: Cookies.get('userid') })
  return (
    <aside className='w-260 h-full p-20 flex flex-col'>
      <article className=' flex flex-col my-4'>
        <AddRoomForm userRooms={userRooms} setUserRooms={setUserRooms}/>
        <JoinWithInviteForm />
      </article>

      <article className='flex flex-col flex-1 overflow-y-auto my-3 py-2 border-t border-black'>
        {
            userRooms && userRooms.length > 0
              ? userRooms.map(room =>
                <JoinRoomButton
                  key={room.id}
                  room={room}
                  currentRoomSetter={currentRoomSetter}
                />
              )
              : <p>{'No rooms where found'}</p>
        }
      </article>
      <article className='py-1'>
        <p>{'some options'}</p>
      </article>
    </aside>
  )
}

function AddRoomForm ({ userRooms, setUserRooms }) {
  return (
      <section className='py-5'>
            <form
                className='flex'
                onSubmit={(event) => {
                  event.preventDefault()
                  const formFields = Object.fromEntries(new FormData(event.target))
                  addRoom({ roomName: formFields.roomName }).then(addRoomResult => {
                    if (addRoomResult.status === 201) {
                      addRoomResult.json().then(room => {
                        addUserToRoom({ roomId: room.id })
                        const updatedUserRooms = [...userRooms, room]
                        setUserRooms(updatedUserRooms)
                      })
                    } else {
                      console.error('error adding room')
                    }
                  })
                }}
            >
                <input type='text' name='roomName' />
                <button type='submit'>{'Create'}</button>
            </form>
      </section>
  )
}

function JoinWithInviteForm () {
  return (
      <section>
        <form
            className='flex'
            onSubmit={(event) => {
              event.preventDefault()
              const formFields = Object.fromEntries(new FormData(event.target))
              getRoomByInviteCode({ inviteCode: formFields.invite }).then(result => {
                if (result.status === 200) {
                  result.json().then(room => {
                    addUserToRoom({ roomId: room.id }).then(addUserToRoomResult => {
                      if (addUserToRoomResult.status === 201) {
                        console.log('user added')
                      }
                    })
                  })
                }
              })
            }}
        >
            <input type='text' name='invite' />
            <button type='submit'>{'Join'} </button>
        </form>
      </section>
  )
}

function JoinRoomButton ({ room, currentRoomSetter }) {
  const roomName = `r_${room.id}_${room.name}`
  const { joinRoom } = useWS()

  return (
        <a className='cursor-pointer' onClick={() => {
          joinRoom(roomName)
          currentRoomSetter(room)
        }}
        >
            {room.name}
        </a>
  )
}

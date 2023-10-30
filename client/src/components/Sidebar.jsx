import { useUserRooms } from '../hooks/useUserRooms'
import Cookies from 'js-cookie'
import { useWS } from '../hooks/useWS'
import { addRoom, addUserToRoom } from '../services/rooms'

export function Sidebar () {
  const { userRooms } = useUserRooms({ userId: Cookies.get('userid') })

  return (
    <aside>
      <AddRoomForm />
      <JoinWithInviteForm />
      {
          userRooms && userRooms.length > 0
            ? userRooms.map(room =>
                <JoinRoomButton key={room.id} id={room.id} name={room.name} />
            )
            : <p>{'No rooms where found'}</p>
      }
    </aside>
  )
}

function AddRoomForm () {
  return (
            <form
                onSubmit={(event) => {
                  const formFields = Object.fromEntries(new FormData(event.target))
                  addRoom(formFields.roomName).then(addRoomResult => {
                    if (addRoomResult.status === 201) {
                      addRoomResult.json().then(room => {
                        addUserToRoom({ roomId: room.id })
                      })
                    } else {
                      console.error('error adding room')
                    }
                  })
                }}
            >
            <input type='text' name='roomName' />
            <button type='submit'>{'New room'}</button>
            </form>
  )
}

function JoinWithInviteForm () {
  return (
        <form
            onSubmit={(event) => {
              const formFields = Object.fromEntries(new FormData(event.target))
              addUserToRoom(Number(formFields)).then(addUserToRoomResult => {
                if (addUserToRoomResult.status === 201) {
                  console.log('user added')
                }
              })
            }}
        >
            <input type='text' name='invite' />
            <button type='submit'>{'Join'} </button>
        </form>
  )
}

function JoinRoomButton ({ id, name }) {
  const roomName = `r_${id}_${name}`
  const { joinRoom } = useWS()

  return (
        <a onClick={() => {
          joinRoom(roomName)
        }}
        >
            {roomName}
        </a>
  )
}

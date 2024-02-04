import { useUserRooms } from '../hooks/useUserRooms'
import { addRoom, addUserToRoom, getRoomByInviteCode } from '../services/rooms'
import { type SetStateAction, useContext, useEffect, useState, useRef } from 'react'
import { UserContext } from '../contexts/userDataContext'
import { useNavigate } from 'react-router-dom'
import { removeUserCookies, sendNotification } from '../utils'
import { type Room } from '../@types/room'
import { type NoteMessage } from '../@types/note'

interface SidebarProps {
  joinRoom: (room: Room) => void
  resetVariables: () => void
  lastReceivedNote: NoteMessage | undefined
  lastEditedNote: NoteMessage | undefined
  lastEditedRoom: Room | undefined
  lastDeletedRoom: Room | undefined
  currentRoom: Room | undefined
  currentRoomSetter: React.Dispatch<React.SetStateAction<Room | undefined>>
}

export const Sidebar: React.FC<SidebarProps> =
({
  joinRoom,
  resetVariables,
  lastReceivedNote,
  lastEditedNote,
  lastEditedRoom,
  lastDeletedRoom,
  currentRoom,
  currentRoomSetter
}) => {
  const userDataContext = useContext(UserContext)
  const { userRooms, setUserRooms } = useUserRooms(Number(userDataContext?.userData.userId))

  // every time a room name is edited, change it in the menu
  useEffect(() => {
    if (userRooms !== undefined && lastEditedRoom !== undefined) {
      const updatedUserRooms = [...userRooms]

      for (const room of userRooms) {
        if (room.id === lastEditedRoom.id) {
          room.name = lastEditedRoom.name
        }
      }
      setUserRooms(updatedUserRooms)
    }
  }, [lastEditedRoom])

  // every time a room is deleted, delete it from the menu
  useEffect(() => {
    if (userRooms !== undefined && lastDeletedRoom !== undefined) {
      const updatedUserRooms = [...userRooms]
      setUserRooms(updatedUserRooms.filter(room => room.id !== lastDeletedRoom.id))
    }
  }, [lastDeletedRoom])

  return (
    <nav className='h-full w-260 px-20 flex flex-col bg-ui-blue text-white'>
      <article className=' flex flex-col gap-3 my-4'>
        <AddRoomForm
            userRooms={userRooms}
            setUserRooms={setUserRooms}
            joinRoom={joinRoom}
            currentUserId={Number(userDataContext?.userData.userId)}
            setCurrentRoom={currentRoomSetter}
        />
        <JoinWithInviteForm
            userRooms={userRooms}
            setUserRooms={setUserRooms}
            joinRoom={joinRoom}
            setCurrentRoom={currentRoomSetter}
        />
      </article>

      <article className='flex flex-col flex-1 overflow-y-auto my-3 py-2 border-y border-white'>
        {
            userRooms.length > 0
              ? userRooms.map(room =>
                <JoinRoomButton
                  key={room.id}
                  room={room}
                  joinRoom={joinRoom}
                  resetVariables={resetVariables}
                  currentRoom={currentRoom}
                  currentRoomSetter={currentRoomSetter}
                  lastReceivedNote={lastReceivedNote}
                  lastEditedNote={lastEditedNote}
                />
              )
              : <p>{'No rooms where found'}</p>
        }
      </article>
        <UserProfile username={userDataContext?.userData.username} />
    </nav>
  )
}

interface AddRoomFormProps {
  userRooms: Room[]
  setUserRooms: React.Dispatch<React.SetStateAction<Room[]>>
  joinRoom: (room: Room) => void
  currentUserId: number
  setCurrentRoom: React.Dispatch<React.SetStateAction<Room | undefined>>
}

const AddRoomForm: React.FC<AddRoomFormProps> =
({
  userRooms,
  setUserRooms,
  joinRoom,
  currentUserId,
  setCurrentRoom
}) => {
  return (
      <button
        className='flex items-center gap-3 px-3 py-1 min-h-[44px] border rounded-md border-white'
        onClick={() => {
          addRoom({
            name: 'new room',
            creator: currentUserId
          })
            .then(addRoomResult => {
              addUserToRoom(addRoomResult.id)
                .then(() => {
                  const updatedUserRooms = [...userRooms, addRoomResult]
                  setUserRooms(updatedUserRooms)
                  joinRoom(addRoomResult)
                  setCurrentRoom(addRoomResult)
                })
                .catch(err => { console.error(err) })
            })
            .catch(err => { console.error(err) })
        }}
      >
        <svg className='svg-xsm' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <title></title>
            <g id="Complete">
              <g data-name="add" id="add-2">
                <g>
                  <line
                    style={{
                      fill: 'none',
                      stroke: '#ffffff',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2.5
                    }}
                    x1="12"
                    x2="12"
                    y1="19"
                    y2="5"
                  ></line>
                  <line
                    style={{
                      fill: 'none',
                      stroke: '#ffffff',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2.5
                    }}
                    x1="5"
                    x2="19"
                    y1="12"
                    y2="12"
                  ></line>
                </g>
              </g>
            </g>
          </g>
        </svg>
        <span>{'Add room'}</span>
      </button>
  )
}

interface JoinWithInviteFormProps {
  userRooms: Room[]
  setUserRooms: React.Dispatch<React.SetStateAction<Room[]>>
  joinRoom: (room: Room) => void
  setCurrentRoom: React.Dispatch<React.SetStateAction<Room | undefined>>
}

const JoinWithInviteForm: React.FC<JoinWithInviteFormProps> =
  ({
    userRooms,
    setUserRooms,
    joinRoom,
    setCurrentRoom
  }) => {
    return (
      <section>
        <form
            className='flex'
            onSubmit={(event) => {
              event.preventDefault()
              const form = event.target as HTMLFormElement
              const formFields = Object.fromEntries(new FormData(form))
              getRoomByInviteCode(formFields.invite as string).then(result => {
                addUserToRoom(result.id).then(() => {
                  const updatedUserRooms = [...userRooms, result]
                  setUserRooms(updatedUserRooms)
                  joinRoom(result)
                  setCurrentRoom(result)
                })
                  .catch(err => { console.error(err) })
              })
                .catch(err => { console.error(err) })
              form.reset()
            }}
        >
            <input
                className='px-3 py-1 w-full text-black outline-none'
                type='text'
                name='invite'
                placeholder='invite code'
            />
        </form>
      </section>
    )
  }

interface JoinRoomButtonProps {
  room: Room
  joinRoom: (room: Room) => void
  resetVariables: () => void
  lastReceivedNote: NoteMessage | undefined
  lastEditedNote: NoteMessage | undefined
  currentRoom: Room | undefined
  currentRoomSetter: React.Dispatch<SetStateAction<Room | undefined>>
}

const JoinRoomButton: React.FC<JoinRoomButtonProps> =
  ({
    room,
    joinRoom,
    resetVariables,
    lastReceivedNote,
    lastEditedNote,
    currentRoom,
    currentRoomSetter
  }) => {
    const [roomNotificationCount, setRoomNotificationCount] = useState<number>(0)
    const userDataContext = useContext(UserContext)

    // every time a note is received or edited, increment the notification count on that room
    useEffect(() => {
      if ((lastReceivedNote !== undefined) &&
         (currentRoom?.id !== room.id) && (lastReceivedNote.room_id === room.id)) {
        const updatedValue = roomNotificationCount
        setRoomNotificationCount(updatedValue + 1)

        if (userDataContext?.userData.username !== lastReceivedNote.creator) {
          sendNotification('New note', `${lastReceivedNote.creator} sent a note!`)
        }
      }
    }, [lastReceivedNote])

    useEffect(() => {
      if ((lastEditedNote !== undefined) &&
         (currentRoom?.id !== room.id) && (lastEditedNote.room_id === room.id)) {
        const updatedValue = roomNotificationCount
        setRoomNotificationCount(updatedValue + 1)

        if (userDataContext?.userData.username !== lastEditedNote.creator) {
          sendNotification('Note edited', `${lastEditedNote.creator} edited a note!`)
        }
      }
    }, [lastEditedNote])

    return (
        <a
            style={{ background: (currentRoom?.id === room.id) ? '#4d77ff' : 'inherit' }}
            className='flex justify-between items-center p-3 text-white rounded-md cursor-pointer'
            onClick={() => {
              setRoomNotificationCount(0)
              resetVariables()
              joinRoom(room)
              currentRoomSetter(room)
            }}
        >
            <section className='flex gap-3 items-center'>
                <svg className='svg-sm' width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                <path
                d="M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473"
                stroke="#ffffff"
                strokeWidth="1.5"
                ></path>
                <path
                d="M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531"
                stroke="#ffffff"
                strokeWidth="1.5"
                ></path>
                <path
                d="M11.7769 10L16.6065 11.2941"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                ></path>
                <path
                d="M11 12.8975L13.8978 13.6739"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                ></path>
                </g>
                </svg>
                <span>{room.name}</span>
            </section>
        {
            (roomNotificationCount > 0) &&
            <section className='bg-[#4d77ff] rounded-full px-3'>
                <span className='text-sm'>{roomNotificationCount}</span>
            </section>
        }
        </a>
    )
  }

interface UserProfileProps {
  username: string | undefined
}

const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const navigate = useNavigate()
  const showOptionsButton = useRef<HTMLButtonElement | null>(null)
  const optionsMenu = useRef<HTMLElement | null>(null)

  window.addEventListener('click', (event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target !== showOptionsButton.current &&
      event.target !== optionsMenu.current
    ) {
      setShowOptions(false)
    }
  })
  return (
        <article className='pt-1 pb-20 relative'>
            {
                showOptions &&
                    <section
                        className='absolute bottom-[75px] w-full p-3 bg-[#0F0F0F] rounded-md'
                        ref={optionsMenu}
                    >
                        <button
                            className='flex items-center gap-3 w-full'
                            onClick={() => {
                              removeUserCookies()
                              navigate('/login', { replace: true })
                            }}
                        >
                            <svg className='svg-xsm' width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                              <g id="SVGRepo_iconCarrier">
                                <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.2429 22 18.8286 22 16.0002 22H15.0002C12.1718 22 10.7576 22 9.87889 21.1213C9.11051 20.3529 9.01406 19.175 9.00195 17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"></path>
                                <path d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                              </g>
                            </svg>
                            <span>{'Log out'}</span>
                        </button>
                    </section>
            }
            <button
                className='flex p-3 w-full rounded-md'
                style={{ backgroundColor: showOptions ? '#4d77ff' : 'inherit' }}
                onClick={() => {
                  setShowOptions(!showOptions)
                }}
                ref={showOptionsButton}
            >
                {username}
            </button>
        </article>
  )
}

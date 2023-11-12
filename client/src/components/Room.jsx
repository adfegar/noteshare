import { NoteColors, NoteList } from './NoteList'
import { useWS } from '../hooks/useWS'
import { useRoomNotes } from '../hooks/useRoomNotes'
import { addUserNote } from '../services/notes'
import { useEffect, useState, useContext } from 'react'
import { deleteRoom, updateRoom } from '../services/rooms'
import { UserDataContext } from '../contexts/userDataContext'

export function Room ({ currentRoom, setCurrentRoom }) {
  const { userData } = useContext(UserDataContext)
  const { lastReceivedNote, lastEditedNote, lastDeletedNote, lastEditedRoom, sendNote, editRoom } = useWS()
  const { roomNotes, setRoomNotes } = useRoomNotes({ roomId: currentRoom?.id })
  const [isInRoomEditMode, setIsInRoomEditMode] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  // each time a note is received, add it to the room notes array
  useEffect(() => {
    if (lastReceivedNote) {
      const updatedRoomNotes = [...roomNotes, lastReceivedNote]
      setRoomNotes(updatedRoomNotes)
    }
  }, [lastReceivedNote])

  // each time a note is edited, change it in the room notes array
  useEffect(() => {
    if (lastEditedNote) {
      const updatedRoomNotes = [...roomNotes]
      for (const note of updatedRoomNotes) {
        if (note.id === lastEditedNote.id) {
          note.content = lastEditedNote.content
          setRoomNotes(updatedRoomNotes)
        }
      }
    }
  }, [lastEditedNote])

  // every time a note is deleted in this room, delete it from the room notes array
  useEffect(() => {
    if (lastDeletedNote) {
      const updatedRoomNotes = [...roomNotes]
      setRoomNotes(updatedRoomNotes.filter(note => note.id !== lastDeletedNote.id))
    }
  }, [lastDeletedNote])

  // every time a room name is edited, change it for all users
  useEffect(() => {
    if (lastEditedRoom) {
      setCurrentRoom({
        id: currentRoom.id,
        name: lastEditedRoom.name
      })
    }
  }, [lastEditedRoom])

  if (currentRoom) {
    return (
        <article className='w-full h-full flex flex-col px-20 py-5'>
            <section className='flex items-center justify-between p-20'>
                {
                    !isInRoomEditMode
                      ? <RoomNameDisplay currentRoom={currentRoom} setIsInRoomEditMode={setIsInRoomEditMode} setCopiedToClipboard={setCopiedToClipboard} />
                      : <EditableRoomNameDisplay currentRoom={currentRoom} setIsInRoomEditMode={setIsInRoomEditMode} editRoom={editRoom} />
                }
                <CopiedToClipBoardPopUp copiedToClipboard={copiedToClipboard} />
                <button
                    className='flex content-center p-[10px] text-white rounded-md bg-[#1c3ffd]'
                    onClick={() => {
                      const randomColorIndex = Math.floor(Math.random() * Object.keys(NoteColors).length)
                      const noteObject = {
                        content: '',
                        color: NoteColors[Object.keys(NoteColors)[randomColorIndex]],
                        user_id: Number(userData.userId),
                        room_id: currentRoom.id
                      }
                      addUserNote(noteObject).then(addNoteResult => {
                        const noteMessage = {
                          id: addNoteResult.id,
                          content: addNoteResult.content,
                          color: addNoteResult.color,
                          creator: userData.username
                        }
                        sendNote(noteMessage)
                      })
                    }}
                >
                        <svg className='max-h-[30px] max-w-[35px] pr-[10px]' width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">

                            <g id="SVGRepo_bgCarrier" strokeWidth="0"/>

                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"/>

                            <g id="SVGRepo_iconCarrier"> <path d="M20 14V7C20 5.34315 18.6569 4 17 4H12M20 14L13.5 20M20 14H15.5C14.3954 14 13.5 14.8954 13.5 16V20M13.5 20H7C5.34315 20 4 18.6569 4 17V12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M7 4V7M7 10V7M7 7H4M7 7H10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </g>

                        </svg>
                        <span className='py-[2px] pr-[5px]'>{'New note'}</span>
                </button>
            </section>
            <NoteList roomNotes={roomNotes} />
        </article>
    )
  }
}

function RoomNameDisplay ({ currentRoom, setIsInRoomEditMode, setCopiedToClipboard }) {
  return (
        <section
            className='flex items-center gap-3'
        >
            <section className='flex'>
            <span className='text-3xl'>{currentRoom.name}</span>
            <button
                onClick={() => {
                  navigator.clipboard.writeText(currentRoom.invite)
                  setCopiedToClipboard(true)
                  setTimeout(() => {
                    setCopiedToClipboard(false)
                  }, 2000)
                }}
            >
                <svg className='svg-md pb-2' width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955" stroke="#1c3ffd" strokeWidth="2" strokeLinecap="round"></path>
                  </g>
                </svg>
            </button>
            </section>
            <section className='flex gap-1'>
                <button
                    onClick={() => {
                      setIsInRoomEditMode(true)
                    }}
                >
                    <svg className='svg-sm' width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        <title></title>
                        <g id="Complete">
                          <g id="edit">
                            <g>
                              <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="#1c3ffd" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              <polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="#1c3ffd" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>
                </button>
                <button
                    onClick={() => {
                      deleteRoom({ roomId: currentRoom.id })
                        .then(deleteRoomResult => {
                          if (deleteRoomResult.status === 201) {
                            console.log('room deleted')
                          }
                        })
                    }}
                >
                    <svg className='svg-sm' width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#1c3ffd" stroke="#1c3ffd" strokeWidth="20.48">
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        <path
                          d="M960 160h-291.2a160 160 0 0 0-313.6 0H64a32 32 0 0 0 0 64h896a32 32 0 0 0 0-64zM512 96a96 96 0 0 1 90.24 64h-180.48A96 96 0 0 1 512 96zM844.16 290.56a32 32 0 0 0-34.88 6.72A32 32 0 0 0 800 320a32 32 0 1 0 64 0 33.6 33.6 0 0 0-9.28-22.72 32 32 0 0 0-10.56-6.72zM832 416a32 32 0 0 0-32 32v96a32 32 0 0 0 64 0v-96a32 32 0 0 0-32-32zM832 640a32 32 0 0 0-32 32v224a32 32 0 0 1-32 32H256a32 32 0 0 1-32-32V320a32 32 0 0 0-64 0v576a96 96 0 0 0 96 96h512a96 96 0 0 0 96-96v-224a32 32 0 0 0-32-32z"
                          fill="#1c3ffd"
                        ></path>
                        <path
                          d="M384 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM544 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM704 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0z"
                          fill="#1c3ffd"
                        ></path>
                      </g>
                    </svg>
                </button>
            </section>
        </section>
  )
}

function EditableRoomNameDisplay ({ currentRoom, setIsInRoomEditMode, editRoom }) {
  return (
    <section>
        <form
            className='flex gap-[10px] items-center'
            onSubmit={(event) => {
              event.preventDefault()
              const formFields = Object.fromEntries(new FormData(event.target))
              updateRoom({ roomId: currentRoom.id, newName: formFields.roomName })
                .then(updateRoomResult => {
                  if (updateRoomResult.status === 201) {
                    editRoom({
                      id: currentRoom.id,
                      name: formFields.roomName
                    })
                    setIsInRoomEditMode(false)
                  }
                })
            }}
        >
            <input className='text-3xl' type='text' name='roomName' defaultValue={currentRoom.name} />
            <button type='submit'>
              <svg
                className='svg-sm'
                width="64px"
                height="64px"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                fill="#231f20"
                stroke="#000000"
                strokeWidth="1.6"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <defs>
                    <style>{'.cls-1 { fill: #231f20; }'}</style>
                  </defs>
                  <g id="check">
                    <path
                      className="cls-1"
                      d="M12.16,28a3,3,0,0,1-2.35-1.13L3.22,18.62a1,1,0,0,1,1.56-1.24l6.59,8.24A1,1,0,0,0,13,25.56L27.17,4.44a1,1,0,1,1,1.66,1.12L14.67,26.67A3,3,0,0,1,12.29,28Z"
                    ></path>
                  </g>
                </g>
              </svg>
            </button>
            <button
                type='button'
                onClick={() => {
                  setIsInRoomEditMode(false)
                }}
            >
                <svg
                  className='svg-sm'
                  fill="#000000"
                  width="64px"
                  height="64px"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M512.481 421.906L850.682 84.621c25.023-24.964 65.545-24.917 90.51 0.105s24.917 65.545-0.105 90.51L603.03 512.377 940.94 850c25.003 24.984 25.017 65.507 0.033 90.51s-65.507 25.017-90.51-0.033L512.397 602.764 174.215 940.03c-25.023 24.964-65.545 24.917-90.51-0.105s-24.917-65.545 0.105-90.51l338.038-337.122L84.14 174.872c-25.003-24.984-25.017-65.507-0.033-90.51s65.507-25.017 90.51-0.033L512.48 421.906z"
                      style={{ fill: '#000000' }}
                    ></path>
                  </g>
                </svg>

            </button>
        </form>
    </section>
  )
}

function CopiedToClipBoardPopUp ({ copiedToClipboard }) {
  if (copiedToClipboard) {
    return (
          <section
          className='px-4 py-3 text-white bg-[#1c3ffd] border border-[#1c3ffd] rounded-md transition duration-150 property-all ease-in-out'
          >
          <span>{'Invite copied to clipboard!'}</span>
          </section>
    )
  }
}

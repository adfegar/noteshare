import { useRoomUsers } from '../hooks/useRoomUsers'
import { NoteColors, NoteList } from './NoteList'
import { useWS } from '../hooks/useWS'
import { useRoomNotes } from '../hooks/useRoomNotes'
import Cookies from 'js-cookie'
import { addUserNote } from '../services/notes'
import { useEffect } from 'react'

export function Room ({ currentRoom }) {
  const { roomNotes, setRoomNotes } = useRoomNotes({ roomId: currentRoom?.id })
  const { receivedNotes, setReceivedNotes, sendMessage } = useWS()
  const { roomUsers } = useRoomUsers({ roomId: currentRoom?.id })
  const { lastEditedNote } = useWS()
  console.log(roomNotes)
  useEffect(() => {
    if (lastEditedNote) {
      for (const note of roomNotes) {
        if (note.id === lastEditedNote.id) {
          note.content = lastEditedNote.content
          setRoomNotes(roomNotes)
        }
      }
    }
  }, [lastEditedNote])

  // reset the received notes array each time the users swaps rooms
  useEffect(() => {
    setReceivedNotes([])
  }, [currentRoom])

  if (currentRoom) {
    return (
        <article className='w-full flex flex-col px-24 py-5'>
            <section className='flex'>
                <span>{`${roomUsers.length} users`}</span>
                <button
                    onClick={() => {
                      const randomColorIndex = Math.floor(Math.random() * Object.keys(NoteColors).length)
                      const noteObject = {
                        content: '',
                        color: NoteColors[Object.keys(NoteColors)[randomColorIndex]],
                        user_id: Number(Cookies.get('userid')),
                        room_id: currentRoom.id
                      }
                      addUserNote(noteObject).then(addNoteResult => {
                        if (addNoteResult.status === 201) {
                          addNoteResult.json().then(addedNote => {
                            const noteMessage = {
                              id: addedNote.id,
                              content: addedNote.content,
                              color: addedNote.color,
                              creator: roomUsers.find((user) => user.id === addedNote.user_id).username
                            }
                            sendMessage(noteMessage)
                          })
                        }
                      })
                    }}
                >
                    {'New note'}
                </button>
            </section>
            <NoteList userNotes={roomNotes.concat(receivedNotes)} />
        </article>
    )
  }
}

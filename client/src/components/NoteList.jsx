import { useState, useContext, useCallback } from 'react'
import { deleteUserNote, updateUserNote } from '../services/notes'
import { UserDataContext } from '../contexts/userDataContext'
import { useWS } from '../hooks/useWS'

export function NoteList ({ roomNotes }) {
  return (
      <section className='grid grid-cols-4 gap-5 pt-20 px-20 overflow-y-auto'>
      {
          (roomNotes && roomNotes.length > 0)
            ? roomNotes.map(note =>
              <Note key={note.id} note={note}/>
            )
            : <p>{'No notes where found'}</p>
      }
    </section>
  )
}

export const NoteColors = {
  BLUE: '#9adcff',
  PINK: '#ff96d1',
  PURPLE: '#d0bfff',
  GREEN: '#c1ffd7',
  YELLOW: '#fff89a',
  ORANGE: '#ffcf96',
  RED: '#ff8080'
}

function Note ({ note }) {
  const { userData } = useContext(UserDataContext)
  if (note.creator === userData.username) {
    return (
        <EditableNoteBody note={note} />
    )
  } else {
    return (
        <NoteBody note={note} />
    )
  }
}

function EditableNoteBody ({ note }) {
  const [isInEditMode, setIsInEditMode] = useState(false)
  const { editNote, deleteNote } = useWS()
  const editContentInput = useCallback((inputElement) => {
    if (inputElement && isInEditMode) {
      inputElement.focus()
    }
  }, [isInEditMode])

  return (
          <article
          style={{ backgroundColor: note.color }}
          className={'flex flex-col p-20 border border-solid border-black rounded font-virgil text-note'}
          >
            {
                !isInEditMode
                  ? <section
                        className='flex-col'
                    >
                        <p className='h-200'>{note.content}</p>
                        <section className='flex justify-between'>
                            <section className='flex gap-2'>
                                <button
                                    onClick={() => {
                                      setIsInEditMode(true)
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
                                        <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                        <polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                                        </g>
                                        </g>
                                        </g>
                                        </g>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                      deleteUserNote({ noteId: note.id })
                                        .then(() => {
                                          deleteNote(note)
                                        })
                                        .catch(error => console.error(error))
                                    }}
                                >
                                    <svg className='svg-sm' width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" strokeWidth="20.48">
                                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                        <g id="SVGRepo_iconCarrier">
                                        <path
                                        d="M960 160h-291.2a160 160 0 0 0-313.6 0H64a32 32 0 0 0 0 64h896a32 32 0 0 0 0-64zM512 96a96 96 0 0 1 90.24 64h-180.48A96 96 0 0 1 512 96zM844.16 290.56a32 32 0 0 0-34.88 6.72A32 32 0 0 0 800 320a32 32 0 1 0 64 0 33.6 33.6 0 0 0-9.28-22.72 32 32 0 0 0-10.56-6.72zM832 416a32 32 0 0 0-32 32v96a32 32 0 0 0 64 0v-96a32 32 0 0 0-32-32zM832 640a32 32 0 0 0-32 32v224a32 32 0 0 1-32 32H256a32 32 0 0 1-32-32V320a32 32 0 0 0-64 0v576a96 96 0 0 0 96 96h512a96 96 0 0 0 96-96v-224a32 32 0 0 0-32-32z"
                                        fill="#000000"
                                        ></path>
                                        <path
                                        d="M384 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM544 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM704 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0z"
                                        fill="#000000"
                                        ></path>
                                        </g>
                                    </svg>
                                </button>
                            </section>
                        <span className='text-lg'>{note.creator}</span>
                        </section>
                        </section>
                  : <section>
                        <form
                            className='flex flex-col'
                            onSubmit={(event) => {
                              event.preventDefault()
                              const formFields = Object.fromEntries(new FormData(event.target))
                              const newNote = {
                                content: formFields.content,
                                color: note.color
                              }

                              updateUserNote(note.id, newNote)
                                .then(() => {
                                  note.content = formFields.content
                                  editNote(note)
                                  setIsInEditMode(false)
                                })
                                .catch(error => console.error(error))
                            }}
                        >
                            <section className='flex justify-between'>
                                <button type='submit'>{'Add'}</button>
                                <button type='button'
                                    onClick={() => {
                                      setIsInEditMode(false)
                                    }}
                                >
                                    {'Cancel'}
                                </button>
                            </section>
                            <textarea
                            name='content'
                            className='h-200 p-20 bg-inherit resize-none focus:outline-none'
                            maxLength={200}
                            defaultValue={note.content}
                            ref={editContentInput}
                            />
                    </form>
                </section>
            }
          </article>
  )
}

function NoteBody ({ note }) {
  return (
        <article
          style={{ backgroundColor: note.color }}
          className={'flex flex-col p-20 border border-solid border-black rounded font-virgil text-note'}
        >
            <p className='h-200'>{note.content}</p>
            <span className='text-lg text-end'>{note.creator}</span>
        </article>
  )
}

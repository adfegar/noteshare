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

// General note component
function Note ({ note }) {
  const { userData } = useContext(UserDataContext)
  if (note.creator === userData.username) {
    return (
        <OwnedNote note={note} />
    )
  } else {
    return (
        <NotOwnedNote note={note} />
    )
  }
}
// Component that represents a note that the user owns
function OwnedNote ({ note }) {
  const [isInEditMode, setIsInEditMode] = useState(false)
  const { editNote, deleteNote } = useWS()

  return (
          <article
          style={{ backgroundColor: note.color }}
          className={'flex flex-col p-20 border border-solid border-black rounded font-virgil text-note'}
          >
            {
                !isInEditMode
                  ? <EditableNoteBody
                        note={note}
                        editNote={editNote}
                        deleteNote={deleteNote}
                        setIsInEditMode={setIsInEditMode}
                    />
                  : <EditNoteContentForm
                        note={note}
                        editNote={editNote}
                        isInEditMode={isInEditMode}
                        setIsInEditMode={setIsInEditMode}
                    />
            }
          </article>
  )
}

function EditableNoteBody ({ note, editNote, deleteNote, setIsInEditMode }) {
  const [isInEditColorMode, setIsInEditColorMode] = useState(false)
  return (
        <section
        className='flex-col relative'
        >
            <p className='h-200'>{note.content}</p>
            {
                isInEditColorMode &&
                    <section className='grid grid-cols-4 gap-3 bg-[#52575D] rounded-md w-[220px] h-[120px] p-[15px] absolute top-[120px] left-[65px]'>
                        {
                            Object.values(NoteColors).map(color =>
                                <button
                                    key={color}
                                    style={{ backgroundColor: color }}
                                    className='rounded-md'
                                    value={color}
                                    onClick={(event) => {
                                      const newNote = {
                                        color: event.target.value
                                      }

                                      updateUserNote(note.id, newNote)
                                        .then(() => {
                                          note.color = newNote.color
                                          editNote(note)
                                          setIsInEditColorMode(false)
                                        })
                                        .catch(error => console.error(error))
                                    }}
                                />
                            )
                        }
                    </section>
            }
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
                          setIsInEditColorMode(!isInEditColorMode)
                        }}
                    >
                        <svg className='svg-sm' width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                          <g id="SVGRepo_iconCarrier">
                            <path d="M8 10.5C8 11.3284 7.32843 12 6.5 12C5.67157 12 5 11.3284 5 10.5C5 9.67157 5.67157 9 6.5 9C7.32843 9 8 9.67157 8 10.5Z" fill="#000000"></path>
                            <path d="M10.5 8C11.3284 8 12 7.32843 12 6.5C12 5.67157 11.3284 5 10.5 5C9.67157 5 9 5.67157 9 6.5C9 7.32843 9.67157 8 10.5 8Z" fill="#000000"></path>
                            <path d="M17 6.5C17 7.32843 16.3284 8 15.5 8C14.6716 8 14 7.32843 14 6.5C14 5.67157 14.6716 5 15.5 5C16.3284 5 17 5.67157 17 6.5Z" fill="#000000"></path>
                            <path d="M7.5 17C8.32843 17 9 16.3284 9 15.5C9 14.6716 8.32843 14 7.5 14C6.67157 14 6 14.6716 6 15.5C6 16.3284 6.67157 17 7.5 17Z" fill="#000000"></path>
                            <path fillRule="evenodd" clipRule="evenodd" d="M1 12C1 5.92487 5.92487 1 12 1C17.9712 1 23 5.34921 23 11V11.0146C23 11.543 23.0001 12.4458 22.6825 13.4987C21.8502 16.2575 18.8203 16.9964 16.4948 16.4024C16.011 16.2788 15.5243 16.145 15.0568 16.0107C14.2512 15.7791 13.5177 16.4897 13.6661 17.2315L13.9837 18.8197L14.0983 19.5068C14.3953 21.289 13.0019 23.1015 11.0165 22.8498C7.65019 22.423 5.11981 21.1007 3.43595 19.1329C1.75722 17.171 1 14.6613 1 12ZM12 3C7.02944 3 3 7.02944 3 12C3 14.2854 3.64673 16.303 4.95555 17.8326C6.25924 19.3561 8.3 20.4894 11.2681 20.8657C11.7347 20.9249 12.2348 20.4915 12.1255 19.8356L12.0163 19.1803L11.7049 17.6237C11.2467 15.3325 13.4423 13.4657 15.6093 14.0885C16.0619 14.2186 16.529 14.3469 16.9897 14.4646C18.7757 14.9208 20.3744 14.2249 20.7677 12.921C20.997 12.161 21 11.5059 21 11C21 6.65079 17.0745 3 12 3Z" fill="#000000"></path>
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

  )
}

// Component that represents the note content editor
function EditNoteContentForm ({ note, editNote, isInEditMode, setIsInEditMode }) {
  return (
        <section>
            <form
                className='flex flex-col'
                onSubmit={(event) => {
                  event.preventDefault()
                  const formFields = Object.fromEntries(new FormData(event.target))
                  const newNote = {
                    content: formFields.content
                  }

                  updateUserNote(note.id, newNote)
                    .then(() => {
                      note.content = newNote.content
                      editNote(note)
                      setIsInEditMode(false)
                    })
                    .catch(error => console.error(error))
                }}
            >
                <section className='flex justify-between'>
                    <button className='text-lg' type='submit'>{'Save'}</button>
                    <button
                        className='text-lg'
                        type='button'
                        onClick={() => {
                          setIsInEditMode(false)
                        }}
                    >
                        {'Cancel'}
                    </button>
                </section>
                <EditNoteTextArea isInEditMode={isInEditMode} defaultContent={note.content} />
            </form>
        </section>

  )
}

// Component that represents the Text Area inside the content editor form
function EditNoteTextArea ({ isInEditMode, defaultContent }) {
  const editContentInput = useCallback((contentTextArea) => {
    if (contentTextArea && isInEditMode) {
      contentTextArea.focus()
    }
  }, [isInEditMode]) // auto focus the text area

  return (
        <textarea
            name='content'
            className='h-200 p-20 bg-inherit resize-none focus:outline-none'
            maxLength={200}
            defaultValue={defaultContent}
            ref={editContentInput}
        />
  )
}

// Component that represents a Note that the user does not own
function NotOwnedNote ({ note }) {
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

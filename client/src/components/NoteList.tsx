import React, { useState, useContext, useCallback, type Dispatch, type SetStateAction, useRef, type RefObject } from 'react'
import { deleteUserNote, updateUserNote } from '../services/notes'
import { UserContext } from '../contexts/userDataContext'
import { type NoteMessage, type Note } from '../@types/note'

interface NoteListProps {
  roomNotes: Note[]
  editNote: (note: NoteMessage) => void
  deleteNote: (note: Note) => void
}

export const NoteList: React.FC<NoteListProps> =
  ({
    roomNotes,
    editNote,
    deleteNote
  }
  ) => {
    const userDataContext = useContext(UserContext)
    return (
      <section className='h-full grid grid-cols-auto gap-5 p-20 overflow-y-auto'>
      {
          (roomNotes.length > 0)
            ? roomNotes.map(note =>
              <NoteComponent
                key={note.id}
                note={note}
                owned={note.creator === userDataContext?.userData.username}
                editNote={editNote}
                deleteNote={deleteNote}
              />
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

interface NoteProps {
  note: Note
  owned: boolean
  editNote: (note: NoteMessage) => void
  deleteNote: (note: Note) => void
}

// General note component
const NoteComponent: React.FC<NoteProps> =
    ({
      note,
      owned,
      editNote,
      deleteNote
    }) => {
      const [isInEditMode, setIsInEditMode] = useState<boolean>(false)

      return (
        <article
          style={{ backgroundColor: note.color }}
          className={'h-280 flex flex-col p-20 border border-solid border-black rounded font-virgil text-note relative'}
        >
            {
                isInEditMode && owned
                  ? <EditNoteComponentBody
                        note={note}
                        editNote={editNote}
                        isInEditMode={isInEditMode}
                        setIsInEditMode={setIsInEditMode}
                    />
                  : <NoteComponentBody
                        note={note}
                        owned={owned}
                        editNote={editNote}
                        deleteNote={deleteNote}
                        setIsInEditMode={setIsInEditMode}
                    />
            }
        </article>
      )
    }

interface NoteBodyProps {
  note: Note
  owned: boolean
  editNote: (note: NoteMessage) => void
  deleteNote: (note: Note) => void
  setIsInEditMode: Dispatch<SetStateAction<boolean>>
}

// Component that represents the body of a note
const NoteComponentBody: React.FC<NoteBodyProps> =
    ({
      note,
      owned,
      editNote,
      deleteNote,
      setIsInEditMode
    }) => {
      const [isInEditColorMode, setIsInEditColorMode] = useState<boolean>(false)
      const editColorButton = useRef<HTMLElement | null>(null)
      const editColorPallete = useRef<HTMLButtonElement | null>(null)
      const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false)
      const infoPanel = useRef<HTMLElement | null>(null)
      const showInfoPanelButton = useRef<HTMLButtonElement | null>(null)
      const userDataContext = useContext(UserContext)

      // add a window listener to close edit color popup when clicking out of area
      window.addEventListener('click', (event) => {
        const isColorPalleteClicked = editColorPallete.current != null && editColorPallete.current.contains(event.target as Node)
        const isEditColorButtonClicked = editColorButton.current != null && editColorButton.current.contains(event.target as Node)
        const isInfoPanelClicked = infoPanel.current != null && infoPanel.current.contains(event.target as Node)
        const isShowInfoPanelButtonClicked = showInfoPanelButton.current != null && showInfoPanelButton.current.contains(event.target as Node)

        if (!isColorPalleteClicked && !isEditColorButtonClicked) {
          setIsInEditColorMode(false)
        }
        if (!isInfoPanelClicked && !isShowInfoPanelButtonClicked) {
          setShowInfoPanel(false)
        }
      })

      function formatInfo (date: Date): string {
        const currentDate = new Date()

        if ((currentDate.getDate() === date.getDate() && currentDate.getMonth() === date.getMonth() && currentDate.getFullYear() === date.getFullYear())) {
          if (currentDate.getMinutes() === date.getMinutes() && currentDate.getHours() === date.getHours()) {
            return 'just now'
          } else if (currentDate.getMinutes() !== date.getMinutes() && currentDate.getHours() === date.getHours()) {
            return `${currentDate.getMinutes() - date.getMinutes()} minutes ago`
          } else if (currentDate.getHours() !== date.getHours()) {
            return `${currentDate.getHours() - date.getHours()} hours ago`
          }
        } else {
          if ((currentDate.getDate() !== date.getDate() && currentDate.getMonth() === date.getMonth() && currentDate.getFullYear() === date.getFullYear())) {
            return `${currentDate.getDate() - date.getDate()} hours ago`
          } else if (currentDate.getMonth() !== date.getMonth() && currentDate.getFullYear() === date.getFullYear()) {
            return `${currentDate.getMonth() - date.getMonth()} months ago`
          } else if (currentDate.getFullYear() !== date.getFullYear()) {
            return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
          }
        }

        return ''
      }

      return (
        userDataContext !== null &&
        <>
            <p className='flex-1 noteContent'>{note.content}</p>
            {
                // INFO PANEL
                showInfoPanel &&
                <section
                    className='infoPanel bg-[#0F0F0F] text-white rounded-md p-[15px] absolute top-[180px] left-[52px]'
                    ref={infoPanel as RefObject<HTMLElement>}
                >
                    <p>
                        {`Created ${formatInfo(note.created_at)}`}
                    </p>
                    <p>
                        {`Edited ${formatInfo(note.edited_at)}`}
                    </p>
                </section>
            }
            {
                // COLOR PALETTE
                isInEditColorMode &&
                    <section
                        className='grid grid-cols-4 gap-3 bg-color-palette-bg rounded-md w-[220px] h-[120px] p-[15px] absolute top-[140px] left-[82px]'
                        ref={editColorPallete}
                    >
                        {
                            Object.values(NoteColors).map(color =>
                                <button
                                    key={color}
                                    style={{ backgroundColor: color }}
                                    className='rounded-md'
                                    value={color}
                                    onClick={(event) => {
                                      const target = event.target as HTMLButtonElement
                                      const newNote = {
                                        content: note.content,
                                        color: target.value
                                      }

                                      updateUserNote(note.id, newNote)
                                        .then((updateNoteResult) => {
                                          const noteMessage = {
                                            id: updateNoteResult.id,
                                            content: updateNoteResult.content,
                                            color: updateNoteResult.color,
                                            creator: userDataContext.userData.username as string,
                                            created_at: updateNoteResult.created_at.toString(),
                                            edited_at: updateNoteResult.edited_at.toString()
                                          }
                                          editNote(noteMessage)
                                          setIsInEditColorMode(false)
                                        })
                                        .catch(error => { console.error(error) })
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
                              setShowInfoPanel(!showInfoPanel)
                            }}
                            ref={showInfoPanelButton as RefObject<HTMLButtonElement>}
                        >
                        <svg fill="#000000"className='svg-sm' width="64px" height="64px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" strokeWidth="10"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                          <path d="M18 23l-1-0v-8.938c0-0.011-0.003-0.021-0.003-0.031s0.003-0.020 0.003-0.031c0-0.552-0.448-1-1-1h-2c-0.552 0-1 0.448-1 1s0.448 1 1 1h1v8h-1c-0.552 0-1 0.448-1 1s0.448 1 1 1h4c0.552 0 1-0.448 1-1s-0.448-1-1-1zM16 11c1.105 0 2-0.896 2-2s-0.895-2-2-2-2 0.896-2 2 0.896 2 2 2zM16-0c-8.836 0-16 7.163-16 16s7.163 16 16 16c8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 30.031c-7.72 0-14-6.312-14-14.032s6.28-14 14-14 14 6.28 14 14-6.28 14.032-14 14.032z"></path>
                        </g>
                          </svg>
                        </button>
                        {
                            // OWNED NOTE OPTIONS
                            owned &&
                            <>
                                <button
                                    onClick={() => {
                                      setIsInEditColorMode(!isInEditColorMode)
                                    }}
                                    ref={editColorButton as RefObject<HTMLButtonElement>}
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
                                      deleteUserNote(note.id)
                                        .then(() => {
                                          deleteNote(note)
                                        })
                                        .catch(error => { console.error(error) })
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
                            </>
                        }
            </section>
            <span className='text-lg'>{note.creator}</span>
        </section>
        </>
      )
    }

interface EditNoteContentBodyProps {
  note: Note
  editNote: (note: NoteMessage) => void
  isInEditMode: boolean
  setIsInEditMode: Dispatch<SetStateAction<boolean>>
}

// Component that represents the body of the note when editing its content
const EditNoteComponentBody: React.FC<EditNoteContentBodyProps> =
    ({
      note,
      editNote,
      isInEditMode,
      setIsInEditMode
    }) => {
      const [contentWordCount, setContentWordCount] = useState<number>(note.content.length)
      const userDataContext = useContext(UserContext)
      return (
        userDataContext !== null &&
            <form
                className='flex flex-col h-280'
                onSubmit={(event) => {
                  event.preventDefault()
                  const formFields = Object.fromEntries(new FormData(event.target as HTMLFormElement))
                  const newNote = {
                    content: formFields.content as string,
                    color: note.color
                  }

                  updateUserNote(note.id, newNote)
                    .then((updateNoteResult) => {
                      const noteMessage = {
                        id: updateNoteResult.id,
                        content: updateNoteResult.content,
                        color: updateNoteResult.color,
                        creator: userDataContext.userData.username as string,
                        created_at: updateNoteResult.created_at.toString(),
                        edited_at: updateNoteResult.edited_at.toString()
                      }
                      editNote(noteMessage)
                      setIsInEditMode(false)
                    })
                    .catch(error => { console.error(error) })
                }}
            >
                <EditNoteTextArea
                    isInEditMode={isInEditMode}
                    setContentWordCount={setContentWordCount}
                    defaultContent={note.content}
                />
                <section className='flex justify-between items-center'>
                    <article className='flex gap-3'>
                        <button
                            type='submit'
                        >
                            <svg className='svg-sm' fill="#000000" width="64px" height="64px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                              <g id="SVGRepo_iconCarrier">
                                <path d="M26 0H6a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6h20a6 6 0 0 0 6-6V6a6 6 0 0 0-6-6zm-6 2v3a1 1 0 1 0 2 0V2h1v7H9V2zm10 24a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V2h1a4 4 0 0 1 4 4zM24 14H8a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V15a1 1 0 0 0-1-1zm-1 12H9V16h14zM12 20h8a1 1 0 0 0 0-2h-8a1 1 0 0 0 0 2zM12 24h8a1 1 0 0 0 0-2h-8a1 1 0 0 0 0 2z"></path>
                              </g>
                            </svg>
                        </button>
                        <button
                            type='button'
                            onClick={() => {
                              setIsInEditMode(false)
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
                    </article>
                    <span>{`${contentWordCount}/200`}</span>
                </section>
            </form>

      )
    }

interface EditNoteTextAreaProps {
  isInEditMode: boolean
  setContentWordCount: Dispatch<SetStateAction<number>>
  defaultContent: string
}

// Component that represents the Text Area inside the content editor form
const EditNoteTextArea: React.FC<EditNoteTextAreaProps> =
({
  isInEditMode,
  setContentWordCount,
  defaultContent
}) => {
  const editContentInput = useCallback((contentTextArea: HTMLTextAreaElement) => {
    if (contentTextArea !== null && isInEditMode) {
      const lastCharacterPosition = contentTextArea.value.length
      contentTextArea.setSelectionRange(lastCharacterPosition, lastCharacterPosition)
      contentTextArea.focus()
    }
  }, [isInEditMode])

  return (
        <textarea
            name='content'
            className='flex-1 bg-inherit resize-none focus:outline-none'
            maxLength={200}
            defaultValue={defaultContent}
            ref={editContentInput}
            onChange={(event) => {
              setContentWordCount(event.target.value.length)
            }}
        />
  )
}

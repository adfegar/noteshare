import { useState, useContext, useCallback } from 'react'
import { updateUserNote } from '../services/notes'
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
  BLUE: '#c2d9ff',
  PINK: '#f8bdeb',
  PURPLE: '#d0bfff',
  GREEN: '#cdfad5',
  YELLOW: '#f6fdc3',
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
  const { editNote } = useWS()
  const editContentInput = useCallback((inputElement) => {
    if (inputElement && isInEditMode) {
      inputElement.focus()
    }
  }, [isInEditMode])

  return (
          <article
          style={{ backgroundColor: note.color }}
          className={'flex flex-col p-20 border border-solid border-black rounded cursor-pointer'}
          onClick={() => {
            if (!isInEditMode) {
              setIsInEditMode(true)
            }
          }}
          >
            <section
                className='flex-col'
                style={{ display: isInEditMode ? 'none' : 'flex' }}
            >
                <p className='h-200'>{note.content}</p>
                <span className='text-end'>{note.creator}</span>
            </section>
            <section
                style={{ display: isInEditMode ? 'block' : 'none' }}
            >
            <form
                className='flex flex-col'
                onSubmit={(event) => {
                  event.preventDefault()
                  const formFields = Object.fromEntries(new FormData(event.target))
                  const newNote = {
                    content: formFields.content,
                    color: note.color
                  }
                  updateUserNote(note.id, newNote).then(updateUserResult => {
                    if (updateUserResult.status === 201) {
                      note.content = formFields.content
                      editNote(note)
                      setIsInEditMode(false)
                    }
                  })
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
                maxLength={500}
                defaultValue={note.content}
                ref={editContentInput}
            />

          </form>
          </section>
          </article>
  )
}

function NoteBody ({ note }) {
  return (
        <article
          style={{ backgroundColor: note.color }}
          className={'flex flex-col p-20 border border-solid border-black rounded'}
        >
            <p className='h-200'>{note.content}</p>
            <span className='text-end'>{note.creator}</span>
        </article>
  )
}

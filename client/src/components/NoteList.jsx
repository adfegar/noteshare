import { useState } from 'react'
import { updateUserNote } from '../services/notes'
import Cookies from 'js-cookie'

export function NoteList ({ userNotes }) {
  return (
      <section className='grid grid-cols-4 gap-5 pt-20'>
      {
          (userNotes && userNotes.length > 0)
            ? userNotes.map(note =>
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
  if (note.creator === Cookies.get('username')) {
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
  const [currentNoteContent, setCurrentNoteContent] = useState(note?.content)
  const [isInEditMode, setIsInEditMode] = useState(false)
  return (
          <article
          style={{ backgroundColor: note.color }}
          className={'flex flex-col p-21 border border-solid border-black rounded cursor-pointer'}
          onClick={() => {
            if (!isInEditMode) {
              setIsInEditMode(true)
            }
          }}
          >
            <section
                style={{ display: isInEditMode ? 'none' : 'block' }}
            >
                <p className=''>{currentNoteContent}</p>
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
                    color: ''
                  }
                  updateUserNote(note.id, newNote).then(updateUserResult => {
                    if (updateUserResult.status === 201) {
                      setCurrentNoteContent(formFields.content)
                      setIsInEditMode(false)
                    }
                  })
                }}
            >
            <section className='flex'>
                <button type='submit'>{'Add'}</button>
                <button type='button'
                onClick={() => {
                  setIsInEditMode(false)
                }}
                >
                    {'Cancel'}
                </button>
            </section>
            <textarea name='content' />
          </form>
          </section>
          </article>
  )
}

function NoteBody ({ note }) {
  return (

        <article
          style={{ backgroundColor: note.color }}
          className={'flex flex-col p-21 border border-solid border-black rounded'}
        >
            <p className=''>{note.Content}</p>
            <span className='text-end'>{note.creator}</span>
        </article>
  )
}

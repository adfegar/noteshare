import { useState } from 'react'

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
  const [isInEditMode, setIsInEditMode] = useState(false)
  return (
      <article
        style={{ backgroundColor: note.color }}
        className={'flex flex-col p-21 border border-solid border-black rounded'}
        onClick={() => {
          setIsInEditMode(!isInEditMode)
        }}
    >
      <section
        style={{ visibility: isInEditMode ? 'hidden' : 'visible' }}
      >
        <p className=''>{note.content}</p>
        <span className='text-end'>{note.creator}</span>
      </section>
      <section
        style={{ visibility: isInEditMode ? 'visible' : 'hidden' }}
      >
        <form
            onSubmit={(event) => {
              event.preventDefault()
            }}
        >
            <textarea name='content' />
            <button type='submit' />
        </form>
      </section>
      </article>
  )
}

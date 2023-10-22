export function NoteList ({ userNotes }) {
  return (
    (userNotes && userNotes.length > 0)
      ? userNotes.map(note =>
            <Note key={note.id} content={note.content}/>
      )
      : <p>{'No notes where found'}</p>

  )
}

function Note ({ content }) {
  return (
        <p>{content}</p>
  )
}

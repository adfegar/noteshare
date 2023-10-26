export function NoteList ({ userNotes }) {
  return (
    (userNotes && userNotes.length > 0)
      ? userNotes.map(note =>
            <Note key={note.id} content={note.content}/>
      )
      : <p>{'No notes where found'}</p>

  )
}

export function Note ({ content }) {
  return (
      <article className="note">
        <p>{content}</p>
      </article>
  )
}

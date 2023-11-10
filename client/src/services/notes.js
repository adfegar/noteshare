import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'

export async function addUserNote (note) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const addNoteResult = await fetch(`${API_PREFIX}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access-token')}`
    },
    body: JSON.stringify(note)
  })

  if (addNoteResult.status === 201) {
    const room = await addNoteResult.json()
    return room
  } else {
    const error = await addNoteResult.json()
    throw new Error(error.error)
  }
}

export async function updateUserNote (noteId, newNote) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const updateNoteResult = await fetch(`${API_PREFIX}/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access-token')}`
    },
    body: JSON.stringify(newNote)
  })

  if (updateNoteResult.status !== 200) {
    const error = await updateNoteResult.json()
    throw new Error(error.error)
  }
}

export async function deleteUserNote ({ noteId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const deleteNoteResult = await fetch(`${API_PREFIX}/notes/${noteId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  if (deleteNoteResult.status !== 200) {
    const error = await deleteNoteResult.json()
    throw new Error(error.error)
  }
}

export async function getUserNotes ({ userId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const userNotesResult = await fetch(`${API_PREFIX}/users/${userId}/notes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  if (userNotesResult.status === 200) {
    const userNotes = await userNotesResult.json()
    return userNotes
  } else {
    const error = await userNotesResult.json()
    throw new Error(error.error)
  }
}

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

  return addNoteResult
}

export async function updateUserNote (noteId, newNote) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const addNoteResult = await fetch(`${API_PREFIX}/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access-token')}`
    },
    body: JSON.stringify(newNote)
  })

  return addNoteResult
}

export async function deleteUserNote ({ noteId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const deleteNoteResult = await fetch(`${API_PREFIX}/notes/${noteId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  return deleteNoteResult
}

export async function getUserNotes ({ userId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const noteResult = await fetch(`${API_PREFIX}/users/${userId}/notes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  return noteResult
}

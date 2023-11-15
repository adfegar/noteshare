import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'
import { instance } from './interceptors'

export async function addUserNote (note) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const addNoteResult = await instance.post(`${API_PREFIX}/notes`, note)

  if (addNoteResult.status === 201) {
    const room = await addNoteResult.data
    return room
  } else {
    const error = await addNoteResult.data
    throw new Error(error.error)
  }
}

export async function updateUserNote (noteId, newNote) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const updateNoteResult = await instance.put(`${API_PREFIX}/notes/${noteId}`, newNote)

  if (updateNoteResult.status !== 200) {
    const error = await updateNoteResult.data
    throw new Error(error.error)
  }
}

export async function deleteUserNote ({ noteId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const deleteNoteResult = await instance.delete(`${API_PREFIX}/notes/${noteId}`)

  if (deleteNoteResult.status !== 200) {
    const error = await deleteNoteResult.data
    throw new Error(error.error)
  }
}

export async function getUserNotes ({ userId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const userNotesResult = await instance.get(`${API_PREFIX}/users/${userId}/notes`)

  if (userNotesResult.status === 200) {
    const userNotes = await userNotesResult.data
    return userNotes
  } else {
    const error = await userNotesResult.data
    throw new Error(error.error)
  }
}

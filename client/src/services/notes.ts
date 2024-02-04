import { type APIError } from '../@types/api'
import { type DBNote, type AddNoteRequest, type UpdateNoteRequest } from '../@types/note'
import { API_PREFIX } from '../consts'
import { instance } from './interceptors'

export async function addUserNote (addNoteRequest: AddNoteRequest): Promise<DBNote> {
  const addNoteResult: { data: DBNote | APIError, status: number } =
    await instance.post(`${API_PREFIX}/notes`, addNoteRequest)

  if (addNoteResult.status !== 201) {
    const error = addNoteResult.data as APIError
    throw new Error(error.error)
  }
  const note = addNoteResult.data as DBNote
  return note
}

export async function updateUserNote (noteId: number, newNote: UpdateNoteRequest): Promise<DBNote> {
  const updateNoteResult: { data: DBNote | APIError, status: number } =
      await instance.put(`${API_PREFIX}/notes/${noteId}`, newNote)

  if (updateNoteResult.status !== 200) {
    const error = updateNoteResult.data as APIError
    throw new Error(error.error)
  }

  const note = updateNoteResult.data as DBNote
  return note
}

export async function deleteUserNote (noteId: number): Promise<void> {
  const deleteNoteResult = await instance.delete(`${API_PREFIX}/notes/${noteId}`)

  if (deleteNoteResult.status !== 200) {
    const error = deleteNoteResult.data as APIError
    throw new Error(error.error)
  }
}

export async function getUserNotes (userId: number): Promise<DBNote[]> {
  const userNotesResult: { data: DBNote[] | APIError, status: number } =
    await instance.get(`${API_PREFIX}/users/${userId}/notes`)

  if (userNotesResult.status !== 200) {
    const error = userNotesResult.data as APIError
    throw new Error(error.error)
  }

  const userNotes = userNotesResult.data as DBNote[]
  return userNotes
}

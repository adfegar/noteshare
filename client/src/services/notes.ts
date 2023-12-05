import { type APIError } from '../@types/api'
import { type AddNoteRequest, type Note, type UpdateNoteRequest } from '../@types/note'
import { API_PREFIX } from '../consts'
import { instance } from './interceptors'

export async function addUserNote (note: AddNoteRequest): Promise<Note> {
  const addNoteResult: { data: Note | APIError, status: number } =
    await instance.post(`${API_PREFIX}/notes`, note)

  if (addNoteResult.status !== 201) {
    const error = addNoteResult.data as APIError
    throw new Error(error.error)
  }
  const room = addNoteResult.data as Note
  return room
}

export async function updateUserNote (noteId: number, newNote: UpdateNoteRequest): Promise<void> {
  const updateNoteResult = await instance.put(`${API_PREFIX}/notes/${noteId}`, newNote)

  if (updateNoteResult.status !== 200) {
    const error = updateNoteResult.data as APIError
    throw new Error(error.error)
  }
}

export async function deleteUserNote (noteId: number): Promise<void> {
  const deleteNoteResult = await instance.delete(`${API_PREFIX}/notes/${noteId}`)

  if (deleteNoteResult.status !== 200) {
    const error = deleteNoteResult.data as APIError
    throw new Error(error.error)
  }
}

export async function getUserNotes (userId: number): Promise<Note[]> {
  const userNotesResult: { data: Note[] | APIError, status: number } =
    await instance.get(`${API_PREFIX}/users/${userId}/notes`)

  if (userNotesResult.status !== 200) {
    const error = userNotesResult.data as APIError
    throw new Error(error.error)
  }

  const userNotes = userNotesResult.data as Note[]
  return userNotes
}

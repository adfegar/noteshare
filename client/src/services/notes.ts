import { APIError } from '../@types/api'
import { AddNoteRequest, Note, UpdateNoteRequest } from '../@types/note'
import { API_PREFIX } from '../consts'
import { instance } from './interceptors'

export async function addUserNote (note: AddNoteRequest): Promise<Note> {
    const addNoteResult: {data: Note|APIError, status: Number}
    = await instance.post(`${API_PREFIX}/notes`, note)

  if (addNoteResult.status !== 201) {
    const error = <APIError> addNoteResult.data
    throw new Error(error.error)
  }
  const room = <Note> addNoteResult.data
  return room
}

export async function updateUserNote (noteId: number, newNote: UpdateNoteRequest): Promise<void> {
  const updateNoteResult = await instance.put(`${API_PREFIX}/notes/${noteId}`, newNote)

  if (updateNoteResult.status !== 200) {
    const error = <APIError> updateNoteResult.data
    throw new Error(error.error)
  }
}

export async function deleteUserNote (noteId: number): Promise<void> {
  const deleteNoteResult = await instance.delete(`${API_PREFIX}/notes/${noteId}`)

  if (deleteNoteResult.status !== 200) {
    const error = <APIError> deleteNoteResult.data
    throw new Error(error.error)
  }
}

export async function getUserNotes (userId: number): Promise<Note[]> {
  const userNotesResult: {data: Note[]|APIError, status: Number} 
    = await instance.get(`${API_PREFIX}/users/${userId}/notes`)

  if (userNotesResult.status !== 200) {
    const error = <APIError> userNotesResult.data
    throw new Error(error.error)
  }

  const userNotes = <Note[]> userNotesResult.data
  return userNotes
}


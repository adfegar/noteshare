import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { instance } from './interceptors'
import { type User } from '../@types/user'
import { type AddRoomRequest, type Room } from '../@types/room'
import { type Note, type DBNote } from '../@types/note'
import { type APIError } from '../@types/api'
import { parseStringDate } from '../utils'

export async function addRoom (room: AddRoomRequest): Promise<Room> {
  const addRoomResult: { data: Room | APIError, status: number } =
        await instance.post(`${API_PREFIX}/rooms`, room)

  if (addRoomResult.status !== 201) {
    const error = addRoomResult.data as APIError
    throw new Error(error.error)
  }
  const addedRoom = addRoomResult.data as Room
  return addedRoom
}

export async function updateRoom (roomId: number, newName: string): Promise<void> {
  const updateRoomResult = await instance.put(`${API_PREFIX}/rooms/${roomId}`, { name: newName })

  if (updateRoomResult.status !== 200) {
    const error = updateRoomResult.data as APIError
    throw new Error(error.error)
  }
}

export async function deleteRoom (roomId: number): Promise<void> {
  const deleteRoomResult = await instance.delete(`${API_PREFIX}/rooms/${roomId}`)

  if (deleteRoomResult.status !== 200) {
    const error = deleteRoomResult.data as APIError
    throw new Error(error.error)
  }
}

export async function addUserToRoom (roomId: number): Promise<void> {
  const addUserToRoomResult = await instance.post(`${API_PREFIX}/users/${Cookies.get('user_id')}/add-to-room`,
    { room_id: Number(roomId) })

  if (addUserToRoomResult.status !== 200) {
    const error = addUserToRoomResult.data as APIError
    throw new Error(error.error)
  }
}

export async function getRoomByInviteCode (inviteCode: string): Promise<Room> {
  const roomResponse: { data: Room | APIError, status: number } =
        await instance.get(`${API_PREFIX}/rooms/${inviteCode}`)

  if (roomResponse.status !== 200) {
    const error = roomResponse.data as APIError
    throw new Error(error.error)
  }

  const rooms = roomResponse.data as Room
  return rooms
}

export async function getUserRooms (userId: number): Promise<Room[]> {
  const roomsResponse: { data: Room[] | APIError, status: number } =
        await instance.get(`${API_PREFIX}/users/${userId}/rooms`)

  if (roomsResponse.status !== 200) {
    const error = roomsResponse.data as APIError
    throw new Error(error.error)
  }

  const rooms = roomsResponse.data as Room[]
  return rooms
}

export async function getRoomUsers (roomId: number): Promise<User[]> {
  const usersResponse: { data: User[] | APIError, status: number } =
        await instance.get(`${API_PREFIX}/rooms/${roomId}/users`)

  if (usersResponse.status !== 200) {
    const error = usersResponse.data as APIError
    throw new Error(error.error)
  }

  const users = usersResponse.data as User[]
  return users
}

export async function getRoomNotes (roomId: number): Promise<Note[]> {
  const roomNotesResult: { data: DBNote[] | APIError, status: number } =
        await instance.get(`${API_PREFIX}/rooms/${roomId}/notes`)

  if (roomNotesResult.status !== 200) {
    const error = roomNotesResult.data as APIError
    throw new Error(error.error)
  }

  const roomUsers = await getRoomUsers(roomId)
  const roomNotes = roomNotesResult.data as DBNote[]
  const resultNotes: Note[] = []
  if (roomNotes != null) {
    roomNotes.forEach(roomNote => {
      const creator = roomUsers.find(user => user.id === roomNote.user_id)
      if (creator !== undefined) {
        const note: Note = {
          id: roomNote.id,
          content: roomNote.content,
          color: roomNote.color,
          creator: creator.username,
          created_at: parseStringDate(roomNote.created_at),
          edited_at: parseStringDate(roomNote.edited_at)
        }
        resultNotes.push(note)
      }
    })
    return resultNotes
  } else {
    return []
  }
}

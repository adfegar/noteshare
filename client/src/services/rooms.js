import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'
import { instance } from './interceptors'

export async function addRoom ({ roomName }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const addRoomResult = await instance.post(`${API_PREFIX}/rooms`, { name: roomName })

  if (addRoomResult.status === 201) {
    const room = await addRoomResult.data
    return room
  } else {
    const error = await addRoomResult.data
    throw new Error(error.error)
  }
}

export async function updateRoom ({ roomId, newName }) {
  const updateRoomResult = await instance.put(`${API_PREFIX}/rooms/${roomId}`, { name: newName })

  if (updateRoomResult.status !== 200) {
    const error = await updateRoomResult.data
    throw new Error(error.error)
  }
}

export async function deleteRoom ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const deleteRoomResult = await instance.delete(`${API_PREFIX}/rooms/${roomId}`)

  if (deleteRoomResult.status !== 200) {
    const error = await deleteRoomResult.data
    throw new Error(error.error)
  }
}

export async function addUserToRoom ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const addUserToRoomResult = await instance.post(`${API_PREFIX}/users/${Cookies.get('userid')}/add-to-room`,
    { room_id: Number(roomId) })

  if (addUserToRoomResult.status !== 200) {
    const error = await addUserToRoomResult.data
    throw new Error(error.error)
  }
}

export async function getRoomByInviteCode ({ inviteCode }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const roomResponse = await instance.get(`${API_PREFIX}/rooms/${inviteCode}`)

  if (roomResponse.status === 200) {
    const room = await roomResponse.data
    return room
  } else {
    const error = await roomResponse.data
    throw new Error(error.error)
  }
}

export async function getUserRooms ({ userId }) {
  const roomsResponse = await instance.get(`${API_PREFIX}/users/${userId}/rooms`)

  if (roomsResponse.status === 200) {
    const rooms = await roomsResponse.data
    return rooms
  } else {
    const error = await roomsResponse.data
    console.log(error)
  }
}

export async function getRoomUsers ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const usersResponse = await instance.get(`${API_PREFIX}/rooms/${roomId}/users`)

  if (usersResponse.status === 200) {
    const users = await usersResponse.data
    return users
  } else {
    const error = await usersResponse.data
    throw new Error(error.error)
  }
}

export async function getRoomNotes ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const roomNotesResult = await instance.get(`${API_PREFIX}/rooms/${roomId}/notes`)

  if (roomNotesResult.status === 200) {
    const roomNotes = await roomNotesResult.data
    const roomUsers = await getRoomUsers({ roomId })
    if (roomNotes != null) {
      return roomNotes.map(note => ({
        id: note.id,
        content: note.content,
        color: note.color,
        creator: roomUsers.find(user => user.id === note.user_id).username
      }))
    }
  } else {
    const error = await roomNotesResult.data
    throw new Error(error.error)
  }
}

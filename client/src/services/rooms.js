import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'
import { getUserNotes } from './notes'

export async function addRoom ({ roomName }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const addRoomResult = await fetch(`${API_PREFIX}/rooms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: roomName
    })
  })

  return addRoomResult
}

export async function updateRoom ({ roomId, newName }) {
  const updateRoomResult = await fetch(`${API_PREFIX}/rooms/${roomId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: newName
    })
  })

  return updateRoomResult
}

export async function deleteRoom ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const deleteRoomResult = await fetch(`${API_PREFIX}/rooms/${roomId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  return deleteRoomResult
}

export async function addUserToRoom ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const addUserToRoomResult = await fetch(`${API_PREFIX}/users/${Cookies.get('userid')}/add-to-room`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      room_id: Number(roomId)
    })
  })
  return addUserToRoomResult
}

export async function getRoomByInviteCode ({ inviteCode }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const roomResponse = await fetch(`${API_PREFIX}/rooms/${inviteCode}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })
  return roomResponse
}

export async function getUserRooms ({ userId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const roomsResponse = await fetch(`${API_PREFIX}/users/${userId}/rooms`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })
  return roomsResponse
}

export async function getRoomUsers ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const usersResponse = await fetch(`${API_PREFIX}/rooms/${roomId}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  if (usersResponse.status === 200) {
    const users = await usersResponse.json()
    return users
  }

  return null
}

export async function getRoomNotes ({ roomId }) {
  const roomUsers = await getRoomUsers({ roomId })
  let roomNotes = []

  if (roomUsers != null) {
    for (const user of roomUsers) {
      const userNotesResult = await getUserNotes({ userId: user.id })

      if (userNotesResult.status === 200) {
        const userNotes = await userNotesResult.json()
        if (userNotes != null) {
          const userRoomNotes = userNotes.filter((note) =>
            note.room_id === roomId
          ).map(note => ({
            id: note.id,
            content: note.content,
            color: note.color,
            creator: user.username
          }))

          roomNotes = roomNotes.concat(userRoomNotes)
        }
      }
    }
  }

  return roomNotes
}

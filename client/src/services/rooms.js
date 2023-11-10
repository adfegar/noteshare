import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'

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

  if (addRoomResult.status === 201) {
    const room = await addRoomResult.json()
    return room
  } else {
    const error = await addRoomResult.json()
    throw new Error(error.error)
  }
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

  if (updateRoomResult.status !== 200) {
    const error = await updateRoomResult.json()
    throw new Error(error.error)
  }
}

export async function deleteRoom ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const deleteRoomResult = await fetch(`${API_PREFIX}/rooms/${roomId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  if (deleteRoomResult.status !== 200) {
    const error = await deleteRoomResult.json()
    throw new Error(error.error)
  }
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

  if (addUserToRoomResult.status !== 200) {
    const error = await addUserToRoomResult.json()
    throw new Error(error.error)
  }
}

export async function getRoomByInviteCode ({ inviteCode }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const roomResponse = await fetch(`${API_PREFIX}/rooms/${inviteCode}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  if (roomResponse.status === 200) {
    const room = await roomResponse.json()
    return room
  } else {
    const error = await roomResponse.json()
    throw new Error(error.error)
  }
}

export async function getUserRooms ({ userId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const roomsResponse = await fetch(`${API_PREFIX}/users/${userId}/rooms`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  if (roomsResponse.status === 200) {
    const rooms = await roomsResponse.json()
    return rooms
  } else {
    const error = await roomsResponse.json()
    throw new Error(error.error)
  }
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
  } else {
    const error = await usersResponse.json()
    throw new Error(error.error)
  }
}

export async function getRoomNotes ({ roomId }) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const roomNotesResult = await fetch(`${API_PREFIX}/rooms/${roomId}/notes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  if (roomNotesResult.status === 200) {
    const roomUsers = await getRoomUsers({ roomId })
    const roomNotes = await roomNotesResult.json()
    return roomNotes.map(note => ({
      id: note.id,
      content: note.content,
      color: note.color,
      creator: roomUsers.find(user => user.id === note.user_id).username
    }))
  } else {
    const error = await roomNotesResult.json()
    throw new Error(error.Error)
  }
}

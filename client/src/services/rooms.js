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

  return addRoomResult
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
      room_id: roomId
    })
  })
  return addUserToRoomResult
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

import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'

export async function getUserRooms ({ userId }) {
  const roomsResponse = await fetch(`${API_PREFIX}/users/${userId}/rooms`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })
  return roomsResponse
}

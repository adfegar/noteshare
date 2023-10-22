import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'

export async function addUserNote (note) {
  console.log(JSON.stringify(note))
  const addNoteResult = await fetch(`${API_PREFIX}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access-token')}`
    },
    body: JSON.stringify(note)
  })

  return addNoteResult
}

export async function getUserNotes () {
  const noteResult = fetch(`${API_PREFIX}/users/${Cookies.get('userid')}/notes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  return noteResult
}

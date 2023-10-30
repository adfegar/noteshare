import Cookies from 'js-cookie'
import { API_PREFIX } from '../consts'
import { checkTokenExp } from './auth'

export async function addUserNote (note) {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const addNoteResult = await fetch(`${API_PREFIX}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access-token')}`
    },
    body: JSON.stringify({
      content: note.content,
      user_id: Number(Cookies.get('userid'))
    })
  })

  return addNoteResult
}

export async function getUserNotes () {
  await checkTokenExp({ token: Cookies.get('access-token') })
  const noteResult = await fetch(`${API_PREFIX}/users/${Cookies.get('userid')}/notes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('access-token')}`
    }
  })

  return noteResult
}

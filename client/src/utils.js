import Cookies from 'js-cookie'
import { getUserByEmail } from './services/users'

export function setUserCookies (email, accessToken, refreshToken) {
  Cookies.set('email', email, { expires: 365 })
  Cookies.set('access-token', accessToken, { expires: 365 })
  Cookies.set('refresh-token', refreshToken, { expires: 365 })

  getUserByEmail({ email }).then(result => {
    Cookies.set('userid', result.id, { expires: 365 })
    Cookies.set('username', result.username, { expires: 365 })
    Cookies.set('authenticated', true)
    window.location.reload(false)
  })
}

export function removeUserCookies () {
  Cookies.remove('email')
  Cookies.remove('access-token')
  Cookies.remove('refresh-token')
  Cookies.remove('userid')
  Cookies.remove('username')
  Cookies.set('authenticated', false)
}

import Cookies from 'js-cookie'
import { getUserByEmail } from './services/users'

export function setUserCookies (email, accessToken, refreshToken) {
  Cookies.set('email', email, { expires: 365 })
  Cookies.set('access-token', accessToken, { expires: 365 })
  Cookies.set('refresh-token', refreshToken, { expires: 365 })

  getUserByEmail({ email }).then(result => {
    Cookies.set('userid', result.id, { expires: 365 })
    Cookies.set('username', result.username, { expires: 365 })
    window.location.reload(false)
  })
}

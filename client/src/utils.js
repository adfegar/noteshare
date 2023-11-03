import Cookies from 'js-cookie'
import { getUserByEmail } from './services/users'

export function setUserCookies (email, accessToken, refreshToken) {
  Cookies.set('email', email, { expires: 365 })
  Cookies.set('access-token', accessToken, { expires: 365 })
  Cookies.set('refresh-token', refreshToken, { expires: 365 })

  getUserByEmail({ email }).then(result => {
    console.log(result.status)
    if (result.status === 200) {
      result.json().then(user => {
        Cookies.set('userid', user.id, { expires: 365 })
        Cookies.set('username', user.username, { expires: 365 })
      })
    }
  })
}

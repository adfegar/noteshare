import Cookies from 'js-cookie'
import { getUserByEmail } from './services/users'

export function setUserCookies (email: string, accessToken: string, refreshToken: string): void {
  Cookies.set('email', email, { expires: 365 })
  Cookies.set('access_token', accessToken, { expires: 365 })
  Cookies.set('refresh_token', refreshToken, { expires: 365 })

  getUserByEmail(email).then(result => {
    Cookies.set('user_id', String(result.id), { expires: 365 })
    Cookies.set('username', result.username, { expires: 365 })
    Cookies.set('authenticated', 'true')
    window.location.reload()
  })
    .catch(err => { console.error(err) })
}

export function removeUserCookies (): void {
  Cookies.remove('email')
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
  Cookies.remove('user_id')
  Cookies.remove('username')
  Cookies.set('authenticated', 'false')
}

export function parseStringDate (dateTimeString: string): Date {
  const dateString = dateTimeString.substring(0, dateTimeString.indexOf('T'))
  const timeString = dateTimeString.substring(dateTimeString.indexOf('T') + 1, dateTimeString.indexOf('.'))

  const [year, month, day] = dateString.split('-')
  const [hour, minutes, seconds] = timeString.split(':')

  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minutes), Number(seconds)))
}

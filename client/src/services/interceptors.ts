import axios from 'axios'
import Cookies from 'js-cookie'
import { checkTokenExp } from './auth'

export const instance = axios.create()

instance.interceptors.request.use(
  request => {
    const allowedUrls = /\/api\/v1\/auth\/*/
    if (request.url !== undefined && !allowedUrls.test(request.url)) {
      const accessToken = Cookies.get('access_token')
      if (accessToken !== undefined) {
        request.headers.Authorization = `Bearer ${accessToken}`
        checkTokenExp(accessToken)
          .catch(err => { console.error(err) })
      }
    }
    return request
  })

instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.request.status === 403) {
      Cookies.set('authenticated', 'false')
      window.location.reload()
    }
    return error
  }
)

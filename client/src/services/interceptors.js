import axios from 'axios'
import Cookies from 'js-cookie'
import { checkTokenExp } from './auth'

export const instance = axios.create()

instance.interceptors.request.use(
  request => {
    const allowedUrls = /\/api\/v1\/auth\/*/
    if (!allowedUrls.test(request.url)) {
      request.headers.Authorization = `Bearer ${Cookies.get('access-token')}`
      checkTokenExp({ token: Cookies.get('access-token') })
    }
    return request
  })

instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.request.status === 403) {
      Cookies.set('authenticated', false)
      window.location.reload(false)
    }
    return error
  }
)

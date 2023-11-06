import { authenticateUser } from '../services/auth'
import { useState, useContext } from 'react'
import { UserDataContext } from '../contexts/userDataContext'
import { Navigate, Link } from 'react-router-dom'
import { setUserCookies } from '../utils'

export function Login () {
  const { userData, setUserData } = useContext(UserDataContext)
  const [message, setMessage] = useState()
  if (userData?.accessToken) {
    return (<Navigate to="/" replace={true} />)
  } else {
    return (
            <main>
                <header>
                    <h1>Log in</h1>
                </header>

                <article className='flex-col'>
                    <form
                        onSubmit={(event) => {
                          event.preventDefault()
                          const formFields = Object.fromEntries(new FormData(event.target))
                          authenticateUser(formFields).then(result => {
                            if (result.ok) {
                              result.json().then(response => {
                                setUserData({
                                  accessToken: response.access_token,
                                  refreshToken: response.refresh_token
                                })
                                setUserCookies(formFields.email, response.access_token, response.refresh_token)
                              })
                            } else {
                              setMessage('incorrect email or password')
                            }
                          })
                        }}
                    >
                    <input type="text" name="email" />
                    <input type="password" name="password" />
                    <button type="submit">Log in</button>
                    </form>
                    <p>{message}</p>
                    <Link to="/register" replace={true}>Register</Link>
                </article>
            </main>
    )
  }
}

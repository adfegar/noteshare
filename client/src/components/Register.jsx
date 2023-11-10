import { useContext, useState } from 'react'
import { UserDataContext } from '../contexts/userDataContext'
import { Navigate } from 'react-router-dom'
import { registerUser } from '../services/auth'
import { setUserCookies } from '../utils'

export function Register () {
  const { userData, setUserData } = useContext(UserDataContext)
  const [message, setMessage] = useState()
  if (userData?.accessToken) {
    return (<Navigate to="/" replace={true} />)
  } else {
    return (
            <main>
                <header>
                    <h1>Register</h1>
                </header>

                <article className='flex-col'>
                    <form
                        onSubmit={(event) => {
                          event.preventDefault()

                          const formFields = Object.fromEntries(new FormData(event.target))
                          registerUser(formFields)
                            .then(response => {
                              setUserData({
                                accessToken: response.access_token,
                                refreshToken: response.refresh_token
                              })
                              setUserCookies(formFields.email, response.access_token, response.refresh_token)
                            })
                            .catch(err => {
                              setMessage('Something happened. Please try again.')
                              console.error(err)
                            })
                        }}
                    >
                    <input type="text" name="username" />
                    <input type="text" name="email" />
                    <input type="password" name="password" />
                    <button type="submit">Log in</button>
                    </form>
                    <p>{message}</p>
                </article>
            </main>
    )
  }
}

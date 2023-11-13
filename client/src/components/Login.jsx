import { authenticateUser } from '../services/auth'
import { useState, useContext } from 'react'
import { UserDataContext } from '../contexts/userDataContext'
import { Navigate, Link } from 'react-router-dom'
import { setUserCookies } from '../utils'
import { FormTextField } from './FormTextField'
import { FormPasswordField } from './FormPasswordField'

export function Login () {
  const { userData, setUserData } = useContext(UserDataContext)
  const [message, setMessage] = useState()
  if (userData?.accessToken) {
    return (<Navigate to="/" replace={true} />)
  } else {
    return (
            <main className='formBox flex flex-col gap-7 rounded-md m-auto relative w-[449px] p-[30px]'>
                <header>
                    <h1 className='text-3xl text-center'>Log in to Noteshare</h1>
                </header>

                <article className='flex-col'>
                    <form
                        className='flex flex-col gap-4'
                        onSubmit={(event) => {
                          event.preventDefault()
                          const formFields = Object.fromEntries(new FormData(event.target))
                          authenticateUser(formFields)
                            .then(response => {
                              setUserData({
                                accessToken: response.access_token,
                                refreshToken: response.refresh_token
                              })
                              setUserCookies(formFields.email, response.access_token, response.refresh_token)
                            })
                            .catch(err => {
                              setMessage('Incorrect email or password. Please, try again')
                              console.error(err)
                            })
                        }}
                    >
                    <FormTextField name={'Email'} required={false} />
                    <FormPasswordField required={false} />
                    <span className='text-center text-error-red'>{message}</span>
                    <button className='p-[10px] bg-ui-blue text-white border rounded-md' type="submit">Log in</button>
                    <span className='text-center'>
                        {'You are not registered?'}
                        <Link className='text-ui-blue' to="/register" replace={true}> Register</Link>
                    </span>
                    </form>
                </article>
            </main>
    )
  }
}

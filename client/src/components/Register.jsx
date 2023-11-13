import { useContext, useState } from 'react'
import { UserDataContext } from '../contexts/userDataContext'
import { Navigate, Link } from 'react-router-dom'
import { registerUser } from '../services/auth'
import { setUserCookies } from '../utils'
import { FormTextField } from './FormTextField'
import { FormPasswordField } from './FormPasswordField'

export function Register () {
  const { userData, setUserData } = useContext(UserDataContext)
  const [message, setMessage] = useState()
  if (userData?.accessToken) {
    return (<Navigate to="/" replace={true} />)
  } else {
    return (
            <main className='formBox flex flex-col gap-7 rounded-md m-auto relative w-[449px] p-[30px]'>
                <header>
                    <h1 className='text-3xl text-center'>Sign up to send fancy notes to your friends!</h1>
                </header>

                <article>
                    <form
                        className='flex flex-col gap-4'
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
                              setMessage('An error ocurred. Please try again.')
                              console.error(err)
                            })
                        }}
                    >
                    <FormTextField name={'Username'} required={true} />
                    <FormTextField name={'Email'} required={true} />
                    <FormPasswordField required={true} />
                    <span className='text-center text-error-red'>{message}</span>
                    <button className='p-[10px] bg-ui-blue text-white border rounded-md' type="submit">Sign Up</button>
                    <span className='text-center'>
                        {'Already registered?'}
                        <Link className='text-ui-blue' to="/login" replace={true}> Log In</Link>
                    </span>
                    </form>
                </article>
            </main>
    )
  }
}

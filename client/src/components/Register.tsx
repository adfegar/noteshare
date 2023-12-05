import { useContext, useState } from 'react'
import { UserContext } from '../contexts/userDataContext'
import { Navigate, Link } from 'react-router-dom'
import { registerUser } from '../services/auth'
import { setUserCookies } from '../utils'
import { FormTextField } from './FormTextField'
import { FormPasswordField } from './FormPasswordField'
import Cookies from 'js-cookie'
import { type RegisterUserRequest } from '../@types/auth'

export const Register: React.FC = () => {
  const userDataContext = useContext(UserContext)
  const [message, setMessage] = useState<string>()
  const [authenticated] = useState<string | undefined>(Cookies.get('authenticated'))

  if (userDataContext?.userData.accessToken !== undefined && (authenticated === 'true')) {
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

                          const formFields = Object.fromEntries(new FormData(event.target as HTMLFormElement))
                          const request: RegisterUserRequest = {
                            username: formFields.username as string,
                            email: formFields.email as string,
                            password: formFields.password as string
                          }
                          registerUser(request)
                            .then(response => {
                              const updatedUserData = { ...userDataContext?.userData }
                              updatedUserData.accessToken = response.access_token
                              updatedUserData.refreshToken = response.refresh_token
                              userDataContext?.setUserData(updatedUserData)
                              setUserCookies(request.email, response.access_token, response.refresh_token)
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

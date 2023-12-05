import { authenticateUser } from '../services/auth'
import { useState, useContext } from 'react'
import { UserContext } from '../contexts/userDataContext'
import { Navigate, Link } from 'react-router-dom'
import { setUserCookies } from '../utils'
import { FormTextField } from './FormTextField'
import { FormPasswordField } from './FormPasswordField'
import Cookies from 'js-cookie'
import { AuthenticateUserRequest } from '../@types/auth'

export const Login: React.FC<{}>= () => {
  const userDataContext = useContext(UserContext)
  const [message, setMessage] = useState<string>()
  const [authenticated] = useState<string>(Cookies.get('authenticated')!)

  if (userDataContext?.userData.accessToken && (authenticated === 'true')) {
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
                          const formFields = Object.fromEntries(new FormData(event.target as HTMLFormElement))
                          const request: AuthenticateUserRequest = {
                              email: formFields.email as string,
                              password: formFields.password as string
                          }
                          authenticateUser(request)
                            .then(response => {
                                const updatedUserData = {...userDataContext!.userData}
                                updatedUserData.accessToken = response.access_token
                                updatedUserData.refreshToken = response.refresh_token
                                userDataContext!.setUserData(updatedUserData)                               
                              setUserCookies(request.email, response.access_token, response.refresh_token)
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


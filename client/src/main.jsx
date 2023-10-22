import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import { Register } from './components/Register.jsx'
import { Login } from './components/Login.jsx'
import { UserDataProvider } from './contexts/userDataContext.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserDataProvider> <App/> </UserDataProvider>
  },
  {
    path: '/login',
    element: <UserDataProvider> <Login/>  </UserDataProvider>
  },
  {
    path: '/register',
    element: <UserDataProvider> <Register/> </UserDataProvider>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

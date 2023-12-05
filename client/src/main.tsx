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
    element: <App/>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  }
])

const root = document.getElementById('root')

if (root !== null) {
  ReactDOM.createRoot(root).render(
        <UserDataProvider>
        <RouterProvider router={router} />
        </UserDataProvider>
  )
}

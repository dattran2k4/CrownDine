import path from '@/constants/path'
import MainLayout from '@/layouts/MainLayout/MainLayout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: path.home,
    element: <MainLayout />,
    errorElement: <div>404 Not Found</div>,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: path.login,
        element: <Login />
      }
    ]
  }
])

export default router

import path from '@/constants/path'
import MainLayout from '@/layouts/MainLayout/MainLayout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Menu from '@/pages/Menu'
import Register from '@/pages/Register' // Giả sử bạn có trang này
import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  // Nhóm 1: Các trang sử dụng MainLayout (Cần Header/Footer)
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
        path: '/menu',
        element: <Menu />
      }
      // Thêm các trang Dashboard, Profile... ở đây
    ]
  },

  // Nhóm 2: Các trang Auth (Cần nền Gradient chuyển động, không cần Header chung)
  {
    path: path.login,
    element: <Login /> // Bây giờ Login sẽ đứng độc lập
  },
  {
    path: path.register, // Ví dụ cho trang đăng ký
    element: <Register />
  }
])

export default router

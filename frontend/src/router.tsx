import path from '@/constants/path'
import MainLayout from '@/layouts/MainLayout/MainLayout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Menu from '@/pages/Menu'
import Register from '@/pages/Register' // Giả sử bạn có trang này
import Reservation from '@/pages/Reservation'
import AdminLayout from '@/layouts/AdminLayout/AdminLayout'
import CategoryList from '@/pages/Admin/Category/CategoryList'
import StaffList from '@/pages/Admin/Staff/StaffList'
import { createBrowserRouter } from 'react-router-dom'
import Profile from '@/pages/Profile'

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
      },
      {
        path: path.profile, // Trang Profile sẽ hiển thị tại '/profile'
        element: <Profile />
        path: path.reservation,
        element: <Reservation />
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
  },

  // Nhóm 3: Admin
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'categories',
        element: <CategoryList />
      },
      {
        path: 'staff',
        element: <StaffList />
      }
    ]
  }
])

export default router

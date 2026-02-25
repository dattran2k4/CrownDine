import path from '@/constants/path'
import MainLayout from '@/layouts/MainLayout/MainLayout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Menu from '@/pages/Menu'
import Register from '@/pages/Register'
import Reservation from '@/pages/Reservation'
import AdminLayout from '@/layouts/AdminLayout/AdminLayout'
import CategoryList from '@/pages/Admin/Category/CategoryList'
import StaffList from '@/pages/Admin/Staff/StaffList'
import PriceSettings from '@/pages/Admin/Price/PriceSettings'
import Dashboard from '@/pages/Admin/Dashboard/Dashboard'
import { createBrowserRouter } from 'react-router-dom'
import LayoutPage from '@/pages/Layout'
import Profile from '@/pages/Profile'
import VerifyRegister from '@/pages/VerifyRegister/VerifyRegister'
import { ProtectedRoute, RejectedRoute } from '@/routes/RouteGuard'

const router = createBrowserRouter([
  {
    path: path.home,
    element: <MainLayout />,
    errorElement: <div>404 Not Found</div>,
    children: [
      { index: true, element: <Home /> },
      { path: '/menu', element: <Menu /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: path.profile, element: <Profile /> },
          { path: path.reservation, element: <Reservation /> },
          { path: 'admin/layout', element: <LayoutPage /> }
        ]
      }
    ]
  },
  {
    element: <RejectedRoute />,
    children: [
      { path: path.login, element: <Login /> },
      { path: path.register, element: <Register /> },
      { path: path.verifyRegister, element: <VerifyRegister /> }
    ]
  },

  // Nhóm 3: Admin
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: path.dashboard,
        element: <Dashboard />
      },
      {
        path: 'categories',
        element: <CategoryList />
      },
      {
        path: 'staff',
        element: <StaffList />
      },
      {
        path: 'price-settings',
        element: <PriceSettings />
      }
    ]
  }
])

export default router

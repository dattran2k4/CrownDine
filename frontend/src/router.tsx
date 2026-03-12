import path from '@/constants/path'
import MainLayout from '@/layouts/MainLayout/MainLayout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Menu from '@/pages/Menu'
import MenuDetail from '@/pages/MenuDetail'
import Register from '@/pages/Register'
import Reservation from '@/pages/Reservation'
import AdminLayout from '@/layouts/AdminLayout/AdminLayout'
import CategoryList from '@/pages/Admin/Category/CategoryList'
import StaffList from '@/pages/Admin/Staff/StaffList'
import PriceSettings from '@/pages/Admin/Price/PriceSettings'
import Dashboard from '@/pages/Admin/Dashboard/Dashboard'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import LayoutPage from '@/pages/Layout'
import Profile from '@/pages/Profile'
import VerifyRegister from '@/pages/VerifyRegister/VerifyRegister'
import { ProtectedRoute, RejectedRoute, AdminRoute, StaffRoute } from '@/routes/RouteGuard'
import StaffLayout from './layouts/StaffLayout/StaffLayout'
import FloorPlan from './pages/Staffs/FloorPlan'
import ReservationList from './pages/Staffs/ReservationList'
import OrderManagement from './pages/Staffs/OrderManagement'
import KitchenDisplay from './pages/Staffs/KitchenDisplay'
import WorkSchedule from './pages/Staffs/WorkSchedule'
import StaffChat from './pages/Staffs/StaffChat'

const router = createBrowserRouter([
  {
    path: path.home,
    element: <MainLayout />,
    errorElement: <div>404 Not Found</div>,
    children: [
      { index: true, element: <Home /> },
      { path: '/menu', element: <Menu /> },
      { path: '/menu/item/:id', element: <MenuDetail /> },
      { path: '/menu/combo/:id', element: <MenuDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: path.profile, element: <Profile /> },
          { path: path.reservation, element: <Reservation /> }
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
    element: <AdminRoute />,
    children: [
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
          },
          {
            path: 'schedule',
            element: <WorkSchedule isAdmin={true} />
          },
          {
            path: 'layout',
            element: <LayoutPage />
          }
        ]
      }
    ]
  },
  // Nhóm 4: Staff
  {
    element: <StaffRoute />,
    children: [
      {
        path: 'staff',
        element: <StaffLayout />,
        children: [
          {
            index: true,
            element: <Navigate to='floor-plan' replace />
          },
          {
            path: 'floor-plan',
            element: <FloorPlan />
          },
          {
            path: 'reservation-list',
            element: <ReservationList />
          },
          {
            path: 'order-management',
            element: <OrderManagement />
          },
          {
            path: 'kitchen-display',
            element: <KitchenDisplay />
          },
          {
            path: 'work-schedule',
            element: <WorkSchedule />
          },
          {
            path: 'chat',
            element: <StaffChat />
          }
        ]
      }
    ]
  }
])

export default router

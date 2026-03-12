import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

export const RejectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

export const AdminRoute = () => {
  const { isAuthenticated, roles } = useAuthStore()
  
  if (!isAuthenticated) return <Navigate to='/login' replace />
  if (!roles.includes('ADMIN')) return <Navigate to='/' replace />
  
  return <Outlet />
}

export const StaffRoute = () => {
  const { isAuthenticated, roles } = useAuthStore()
  
  if (!isAuthenticated) return <Navigate to='/login' replace />
  if (!roles.includes('STAFF')) return <Navigate to='/' replace />
  
  return <Outlet />
}

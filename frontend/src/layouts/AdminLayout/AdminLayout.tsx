import { Outlet } from 'react-router-dom'
import AdminHeader from '@/components/AdminHeader'

export default function AdminLayout() {
  return (
    <div className='flex min-h-screen flex-col'>
      <AdminHeader />
      {/* --- MAIN CONTENT --- */}
      <main className='bg-muted/20 min-h-0 flex-1'>
        <div className='container mx-auto px-4 py-8'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

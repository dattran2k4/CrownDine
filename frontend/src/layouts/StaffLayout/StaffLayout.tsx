import StaffHeader from '@/components/Header/StaffHeader/StaffHeader'

import { Outlet } from 'react-router-dom'

function StaffLayout() {
  return (
    <div className='flex min-h-screen flex-col'>
      <main className='bg-muted/20 min-h-0 flex-1'>
        <StaffHeader />
        <div className='container mx-auto px-4 py-8'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default StaffLayout

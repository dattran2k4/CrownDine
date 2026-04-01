import { Outlet, useLocation } from 'react-router-dom'
import StaffHeader from '@/components/Header/StaffHeader/StaffHeader'

function StaffLayout() {
  const { pathname } = useLocation()
  const isReservationListPage = pathname === '/staff/reservation-list'

  return (
    <div className='flex min-h-screen flex-col'>
      <main className='bg-muted/20 min-h-0 flex-1 flex flex-col'>
        <StaffHeader />
        <div className={isReservationListPage ? 'flex-1 flex flex-col' : 'container mx-auto px-4 py-8 flex-1 flex flex-col'}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default StaffLayout

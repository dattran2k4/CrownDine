import { Outlet } from 'react-router-dom'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

const MainLayout = () => {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <main style={{ height: 'calc(100vh - 120px)' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout

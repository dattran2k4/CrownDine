import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

const MainLayout = () => {
  const location = useLocation()

  useEffect(() => {
    // Scroll to section when hash changes (e.g. /#menu)
    const hash = location.hash
    if (!hash) return

    const id = hash.startsWith('#') ? hash.slice(1) : hash
    if (!id) return

    const HEADER_OFFSET = 84
    let tries = 0

    const tryScroll = () => {
      tries += 1
      const el = document.getElementById(id)
      if (!el) {
        if (tries < 20) window.setTimeout(tryScroll, 50)
        return
      }

      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
      window.scrollTo({ top, behavior: 'smooth' })
    }

    tryScroll()
  }, [location.pathname, location.hash])

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <Header />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout

import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  const navItems = [
    { label: 'Thực đơn', href: '/admin/categories' },
    { label: 'Nhân Viên', href: '/admin/staff' },
    { label: 'Lịch làm việc', href: '/admin/schedule' },
    { label: 'Chấm Công', href: '/admin/timekeeping' },
    { label: 'Quản lý phòng bàn', href: '/admin/tables' },
    { label: 'Báo Cáo doanh thu', href: '/admin/reports' },
    { label: 'Trợ lý AI', href: '/admin/ai-assistant' }
  ]

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/50 sticky top-0 z-50 border-b backdrop-blur'>
        <nav className='container mx-auto flex items-center justify-between px-4 py-3'>
          {/* Logo */}
          <Link to='/admin' className='flex items-center gap-2 transition-opacity hover:opacity-80'>
            <Logo />
            <span className='text-foreground hidden text-xl font-bold tracking-tight sm:inline'>
              CrownDine <span className='text-primary text-sm font-light'>Admin</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden items-center gap-6 xl:flex'>
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  'hover:text-primary text-sm font-medium transition-colors',
                  location.pathname.startsWith(item.href) ? 'text-primary font-bold' : 'text-foreground/80'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className='flex items-center gap-3'>
            {/* Theme Toggle */}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className='hover:bg-accent/10'
            >
              {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
            </Button>

            {/* Logout Button */}
            <Button variant='ghost' size='sm' className='text-muted-foreground hover:text-destructive gap-2'>
              <LogOut className='h-4 w-4' />
              <span className='hidden sm:inline'>Logout</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button variant='ghost' size='icon' onClick={() => setIsOpen(!isOpen)} className='xl:hidden'>
              {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className='bg-card border-border animate-in fade-in slide-in-from-top-2 border-t duration-200 xl:hidden'>
            <div className='container mx-auto flex flex-col gap-2 px-4 py-4'>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    location.pathname.startsWith(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/80 hover:bg-accent'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className='bg-muted/20 min-h-0 flex-1'>
        <div className='container mx-auto px-4 py-8'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

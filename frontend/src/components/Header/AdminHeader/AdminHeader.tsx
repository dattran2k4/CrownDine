import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  const navItems = [
    { label: 'Tổng quan', href: '/admin/dashboard' },
    {
      label: 'Hàng hoá',
      children: [
        { label: 'Thực đơn', href: '/admin/categories' },
        { label: 'Thiết lập giá', href: '/admin/price-settings' }
      ]
    },
    {
      label: 'Nhân Viên',
      children: [
        { label: 'Danh sách nhân viên', href: '/admin/staff' },
        { label: 'Lịch làm việc', href: '/admin/schedule' },
        { label: 'Bảng chấm công', href: '/admin/attendance' }
      ]
    },
    { label: 'Quản lý phòng bàn', href: '/admin/layout' },
    { label: 'Báo Cáo doanh thu', href: '/admin/reports' },
    { label: 'Trợ lý AI', href: '/admin/ai-assistant' }
  ]

  const isActive = (item: any) => {
    if (item.href === location.pathname) return true
    if (item.children) {
      return item.children.some((child: any) => child.href === location.pathname)
    }
    return false
  }

  const toggleMobileMenu = (label: string) => {
    setExpandedMobileMenu(expandedMobileMenu === label ? null : label)
  }

  return (
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
            <div key={item.label} className='group relative'>
              {item.children ? (
                <>
                  <button
                    className={cn(
                      'group flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary',
                      isActive(item) ? 'font-bold text-primary' : 'text-foreground/80'
                    )}
                  >
                    {item.label}
                    {/* Simple CSS Chevron */}
                    <svg
                      className='h-4 w-4 transition-transform duration-200 group-hover:rotate-180'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                  </button>
                  {/* Dropdown */}
                  <div className='absolute left-1/2 top-full hidden w-56 -translate-x-1/2 pt-4 animate-in fade-in zoom-in-95 group-hover:block'>
                    <div className='bg-card border-border overflow-hidden rounded-md border shadow-lg ring-1 ring-black/5 p-1'>
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className={cn(
                            'block rounded-sm px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-primary',
                            location.pathname === child.href ? 'bg-primary/5 text-primary font-medium' : 'text-foreground/80'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={item.href!}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive(item) ? 'font-bold text-primary' : 'text-foreground/80'
                  )}
                >
                  {item.label}
                </Link>
              )}
            </div>
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
        <div className='animate-in fade-in slide-in-from-top-2 border-t border-border bg-card duration-200 xl:hidden'>
          <div className='container mx-auto flex flex-col px-4 py-4'>
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMobileMenu(item.label)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent',
                        isActive(item) ? 'text-primary' : 'text-foreground/80'
                      )}
                    >
                      {item.label}
                      <svg
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          expandedMobileMenu === item.label ? 'rotate-180' : ''
                        )}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                      </svg>
                    </button>
                    {expandedMobileMenu === item.label && (
                      <div className='ml-4 flex flex-col gap-1 border-l border-border/50 pl-4 mt-1'>
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'block rounded-md px-3 py-2 text-sm transition-colors hover:text-primary',
                              location.pathname === child.href ? 'text-primary font-medium' : 'text-muted-foreground'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href!}
                    className={cn(
                      'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(item) ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-accent'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

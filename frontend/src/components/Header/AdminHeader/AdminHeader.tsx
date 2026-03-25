import { Children, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Moon, Sun, LogOut, User, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import authApi from '@/apis/auth.api'
import { toast } from 'react-toastify'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const refreshToken = useAuthStore((state) => state.refreshToken)

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(refreshToken || ''),
    onSuccess: () => {
      logout()
      toast.success('Đăng xuất thành công')
      navigate('/login')
    },
    onError: () => {
      logout()
      toast.error('Có lỗi xảy ra khi đăng xuất')
      navigate('/login')
    }
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const navItems = [
    { label: 'Tổng quan', href: '/admin/dashboard' },
    {
      label: 'Hàng hoá',
      children: [
        { label: 'Thực đơn', href: '/admin/categories' },
        { label: 'Thiết lập giá', href: '/admin/price-settings' },
        { label: 'Voucher', href: '/admin/vouchers' }
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
    {
      label: 'Quản lý ',
      children: [
        { label: 'Phòng bàn', href: '/admin/layout' },
        { label: 'Thanh toán', href: '/admin/payment-management' }
      ]
    },

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
                      'group hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors',
                      isActive(item) ? 'text-primary font-bold' : 'text-foreground/80'
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
                  <div className='animate-in fade-in zoom-in-95 absolute top-full left-1/2 hidden w-56 -translate-x-1/2 pt-4 group-hover:block'>
                    <div className='bg-card border-border overflow-hidden rounded-md border p-1 shadow-lg ring-1 ring-black/5'>
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className={cn(
                            'hover:bg-accent hover:text-primary block rounded-sm px-4 py-2 text-sm transition-colors',
                            location.pathname === child.href
                              ? 'bg-primary/5 text-primary font-medium'
                              : 'text-foreground/80'
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
                    'hover:text-primary text-sm font-medium transition-colors',
                    isActive(item) ? 'text-primary font-bold' : 'text-foreground/80'
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
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
                  <Avatar className='border-primary/20 h-10 w-10 cursor-pointer border'>
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className='bg-primary/10 text-primary'>
                      {user?.firstName?.charAt(0) || <User className='h-5 w-5' />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='border-border w-56 bg-white opacity-100 shadow-md' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm leading-none font-medium'>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className='text-muted-foreground text-xs leading-none'>{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to='/profile' className='cursor-pointer'>
                    <User className='mr-2 h-4 w-4' />
                    <span>Hồ sơ của tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to='/settings' className='cursor-pointer'>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='cursor-pointer text-red-600 focus:text-red-600' onClick={handleLogout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant='ghost' size='icon' onClick={() => setIsOpen(!isOpen)} className='xl:hidden'>
            {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className='animate-in fade-in slide-in-from-top-2 border-border bg-card border-t duration-200 xl:hidden'>
          <div className='container mx-auto flex flex-col px-4 py-4'>
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMobileMenu(item.label)}
                      className={cn(
                        'hover:bg-accent flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
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
                      <div className='border-border/50 mt-1 ml-4 flex flex-col gap-1 border-l pl-4'>
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'hover:text-primary block rounded-md px-3 py-2 text-sm transition-colors',
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

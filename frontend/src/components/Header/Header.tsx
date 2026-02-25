import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun, User, LogOut, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../ui/logo'
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

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const navItems = [
    { label: 'Menu', href: 'menu' },
    { label: 'Câu Chuyện', href: '#story' },
    { label: 'Đặt Bàn', href: 'reservation' },
    { label: 'Liên Hệ', href: '#contact' }
  ]
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
      toast.success('Đăng xuất thành công')
      navigate('/login')
    },
    onError: () => {
      logout() // Always clear local state even if api fails
      toast.error('Có lỗi xảy ra khi đăng xuất')
      navigate('/login')
    }
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/50 sticky top-0 z-50 border-b backdrop-blur'>
      <nav className='container mx-auto flex items-center justify-between px-4 py-3'>
        {/* Logo */}
        <Link to='/' className='flex items-center gap-2 transition-opacity hover:opacity-80'>
          <Logo />
          <span className='text-foreground hidden text-xl font-bold tracking-tight sm:inline'>CrownDine</span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden items-center gap-8 md:flex'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={`/${item.href}`}
              className='text-foreground/80 hover:text-primary text-sm font-medium transition-colors'
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className='flex items-center gap-4'>
          {/* Theme Toggle */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='hover:bg-accent/10 cursor-pointer'
          >
            {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
          </Button>

          {/* Book Button */}
          <Link to='/#reservation'>
            <Button className='bg-primary hover:bg-primary/90 btn-lift border-primary hidden cursor-pointer rounded-full border px-6 py-2 font-semibold text-white transition-all duration-300 sm:inline-flex'>
              Book a Table
            </Button>
          </Link>

          {isAuthenticated ? (
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
          ) : (
            <div className='hidden items-center gap-2 sm:flex'>
              <Link to='/login'>
                <Button variant='ghost' className='cursor-pointer text-sm font-medium'>
                  Đăng nhập
                </Button>
              </Link>
              <Link to='/register'>
                <Button className='bg-primary cursor-pointer rounded-full px-5 text-sm text-white'>Đăng ký</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant='ghost' size='icon' onClick={() => setIsOpen(!isOpen)} className='md:hidden'>
            {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className='bg-card border-border animate-in fade-in slide-in-from-top-2 border-t duration-200 md:hidden'>
          <div className='container mx-auto flex flex-col gap-4 px-4 py-4'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={`/${item.href}`}
                className='text-foreground/80 hover:text-primary py-2 font-medium transition-colors'
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link to='/#reservation' onClick={() => setIsOpen(false)} className='w-full'>
              <Button className='bg-primary hover:bg-primary/90 btn-lift border-primary w-full rounded-full border font-semibold text-white transition-all duration-300'>
                Book a Table
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

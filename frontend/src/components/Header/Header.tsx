import { useContext, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link } from 'react-router-dom'
import { Logo } from '../ui/logo'
import { AppContext } from '@/contexts/app.context'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const navItems = [
    { label: 'Menu', href: 'menu' },
    { label: 'Câu Chuyện', href: '#story' },
    { label: 'Đặt Bàn', href: 'reservation' },
    { label: 'Liên Hệ', href: '#contact' }
  ]
  const { isAuthenticated } = useContext(AppContext)
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
            className='hover:bg-accent/10'
          >
            {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
          </Button>

          {/* Book Button */}
          <Link to='/#reservation'>
            <Button className='bg-primary hover:bg-primary/90 btn-lift border-primary hidden rounded-full border px-6 py-2 font-semibold text-white transition-all duration-300 sm:inline-flex'>
              Book a Table
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button variant='ghost' size='icon' onClick={() => setIsOpen(!isOpen)} className='md:hidden'>
            {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </Button>
        </div>

        {isAuthenticated ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
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

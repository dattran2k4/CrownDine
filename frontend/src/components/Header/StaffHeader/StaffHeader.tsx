import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

const StaffHeader = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const navItems = [
    { label: 'Trạng thái bàn', href: 'staff/floor-plan' },
    { label: 'Đơn đặt bàn', href: 'staff/reservation-list' },
    { label: 'Đơn gọi món', href: 'staff/order-management' },
    { label: 'Bếp', href: 'staff/kitchen-display' },
    { label: 'Lịch làm việc', href: 'staff/work-schedule' },
    { label: 'Chat', href: 'staff/chat' }
  ]
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
          </div>
        </div>
      )}
    </header>
  )
}

export default StaffHeader

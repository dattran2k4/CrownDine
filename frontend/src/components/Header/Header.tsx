'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link } from 'react-router-dom'
import { Logo } from '../ui/logo'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const navItems = [
    { label: 'Menu', href: '#menu' },
    { label: 'Câu Chuyện', href: '#story' },
    { label: 'Đặt Bàn', href: '#reservation' },
    { label: 'Liên Hệ', href: '#contact' },
  ]

  return(
<header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Logo/>
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline">CrownDine</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:bg-accent/10"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Book Button */}
          <a href="#reservation">
            <Button
              className="bg-primary hover:bg-primary/90 text-white hidden sm:inline-flex font-semibold rounded-full transition-all duration-300 btn-lift border border-primary px-6 py-2"
            >
              Book a Table
            </Button>
          </a>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a href="#reservation" onClick={() => setIsOpen(false)} className="w-full">
              <Button className="bg-primary hover:bg-primary/90 text-white w-full font-semibold rounded-full transition-all duration-300 btn-lift border border-primary">
                Book a Table
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

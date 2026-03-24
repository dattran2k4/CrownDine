import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun, User, LogOut, Settings, Heart, Trash2, Bell } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFavoriteStore } from '@/stores/useFavoriteStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import authApi from '@/apis/auth.api'
import notificationApi from '@/apis/notification.api'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from '@/components/ui/logo'
import { useEffect } from 'react'
import type { NotificationItem } from '@/types/notification.type'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()

  const navItems = [
    { label: 'Thực Đơn', href: '#menu' },
    { label: 'Câu Chuyện', href: '#story' },
    { label: 'Đặt Bàn', href: 'reservation' },
    { label: 'Liên Hệ', href: '#contact' }
  ]
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const { favorites, fetchFavorites, removeFavoriteItem, removeFavoriteCombo, clearFavorites } = useFavoriteStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites()
    } else {
      clearFavorites()
    }
  }, [isAuthenticated, fetchFavorites, clearFavorites])
  const navigate = useNavigate()

  const { data: unreadNotificationCount } = useQuery({
    queryKey: ['unread-notification-count', isAuthenticated],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: isAuthenticated,
    select: (response) => response.data.data.unreadCount
  })

  const { data: notifications } = useQuery({
    queryKey: ['my-notifications', isAuthenticated],
    queryFn: () => notificationApi.getMyNotifications(1, 5),
    enabled: isAuthenticated,
    select: (response) => response.data.data.data
  })

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] })
    }
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(refreshToken || ''),
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

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.readAt) {
      markNotificationAsReadMutation.mutate(notification.id)
    }
  }

  const formatNotificationTime = (createdAt: string) => {
    return new Date(createdAt).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })
  }

  return (
    <header className='bg-background/95 supports-backdrop-filter:bg-background/60 border-border/50 sticky top-0 z-50 border-b backdrop-blur'>
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

          {/* Favorites Dropdown */}
          {isAuthenticated && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='hover:bg-accent/10 relative cursor-pointer'
                    aria-label='Thông báo'
                  >
                    <Bell className='h-5 w-5' />
                    {(unreadNotificationCount ?? 0) > 0 && (
                      <span className='bg-primary absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] text-white'>
                        {unreadNotificationCount! > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='border-border w-96 bg-card opacity-100 shadow-lg' align='end'>
                  <DropdownMenuLabel className='flex items-center justify-between'>
                    <span>Thông báo</span>
                    <span className='text-muted-foreground text-xs font-normal'>
                      {unreadNotificationCount ?? 0} chưa đọc
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className='max-h-90 overflow-y-auto'>
                    {!notifications || notifications.length === 0 ? (
                      <div className='text-muted-foreground flex flex-col items-center justify-center py-8 text-sm'>
                        <Bell className='mb-2 h-8 w-8 opacity-20' />
                        <p>Chưa có thông báo nào</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`focus:bg-accent/10 flex cursor-pointer items-start gap-3 p-3 ${
                            !notification.readAt ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${!notification.readAt ? 'bg-primary' : 'bg-muted'}`}
                          />
                          <div className='flex min-w-0 flex-1 flex-col'>
                            <div className='flex items-start justify-between gap-3'>
                              <span className='truncate text-sm font-semibold'>{notification.title}</span>
                              <span className='text-muted-foreground shrink-0 text-[11px]'>
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className='text-muted-foreground mt-1 line-clamp-2 text-xs leading-5'>
                              {notification.message}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='hover:bg-accent/10 relative cursor-pointer'>
                    <Heart className='h-5 w-5' />
                    {favorites.length > 0 && (
                      <span className='bg-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white'>
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='border-border w-80 bg-card opacity-100 shadow-lg' align='end'>
                  <DropdownMenuLabel className='flex items-center justify-between'>
                    <span>Món ăn yêu thích</span>
                    <span className='text-muted-foreground text-xs font-normal'>{favorites.length} món</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className='max-h-87.5 overflow-y-auto'>
                    {favorites.length === 0 ? (
                      <div className='text-muted-foreground flex flex-col items-center justify-center py-8 text-sm'>
                        <Heart className='mb-2 h-8 w-8 opacity-20' />
                        <p>Chưa có món yêu thích nào</p>
                      </div>
                    ) : (
                      favorites.map((fav) => {
                        const item = fav.item || fav.combo
                        if (!item) return null
                        const isCombo = !!fav.combo
                        const link = isCombo ? `/menu/combo/${item.id}` : `/menu/item/${item.id}`

                        return (
                          <div key={fav.id} className='hover:bg-accent/5 flex items-center gap-3 p-3 transition-colors'>
                            <Link to={link} className='h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted'>
                              <img src={item.imageUrl || ''} alt={item.name} className='h-full w-full object-cover' />
                            </Link>
                            <div className='flex min-w-0 flex-1 flex-col'>
                              <Link to={link} className='hover:text-primary truncate text-sm font-medium'>
                                {item.name}
                              </Link>
                              <span className='text-primary text-xs font-semibold'>
                                {item.priceAfterDiscount
                                  ? item.priceAfterDiscount.toLocaleString()
                                  : item.price?.toLocaleString()}
                                đ
                              </span>
                            </div>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-muted-foreground hover:text-destructive'
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (isCombo) {
                                  removeFavoriteCombo(item.id)
                                } else {
                                  removeFavoriteItem(item.id)
                                }
                              }}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        )
                      })
                    )}
                  </div>
                  {favorites.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <Link
                        to='/profile?tab=favorites'
                        className='text-primary block p-2 text-center text-xs font-medium hover:underline'
                      >
                        Xem tất cả yêu thích
                      </Link>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Book Button */}
          <Link to='/#reservation'>
            <Button className='bg-primary hover:bg-primary/90 btn-lift border-primary hidden cursor-pointer rounded-full border px-6 py-2 font-semibold text-white transition-all duration-300 sm:inline-flex'>
              Đặt Bàn
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
              <DropdownMenuContent className='border-border w-56 bg-card opacity-100 shadow-md' align='end' forceMount>
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
                <DropdownMenuItem className='cursor-pointer text-destructive focus:text-destructive' onClick={handleLogout}>
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

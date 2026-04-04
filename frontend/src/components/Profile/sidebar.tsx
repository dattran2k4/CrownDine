import { useRef } from 'react'
import type { User } from '@/types/profile.type'
import { User as UserIcon, Clock, Lock, Camera, Loader2, Ticket, Heart, Gift } from 'lucide-react'
import { calculateMembershipTier, getMembershipTierConfig } from '@/lib/membership_tier'
import userApi from '@/apis/user.api'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'

interface ProfileSidebarProps {
  user: User
  activeTab: string
  onTabChange: (tabId: string) => void
}

const ProfileSidebar = ({ user, activeTab, onTabChange }: ProfileSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const setUser = useAuthStore((state) => state.setUser)

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: (res) => {
      if (res.data?.data) {
        setUser({ ...user, avatar: res.data.data })
        toast.success('Cập nhật ảnh đại diện thành công')
      }
    },
    onError: () => {
      toast.error('Cập nhật ảnh đại diện thất bại')
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh')
        return
      }
      uploadAvatarMutation.mutate(file)
    }
  }

  const tabs = [
    { id: 'info', label: 'Thông Tin Của Tôi', icon: UserIcon },
    { id: 'reservations', label: 'Lịch Sử Đặt Bàn', icon: Clock },
    { id: 'favorites', label: 'Yêu Thích', icon: Heart },
    { id: 'reward-points', label: 'Điểm Thưởng', icon: Gift },
    { id: 'vouchers', label: 'Voucher Của Tôi', icon: Ticket },
    { id: 'security', label: 'Mật Khẩu & Bảo Mật', icon: Lock }
  ]
  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }
  return (
    <aside className='bg-card border-border sticky top-20 h-fit w-full rounded-lg border p-6'>
      {/* Avatar Section */}
      <div className='mb-8 flex flex-col items-center'>
        <div
          className='group border-primary bg-primary/10 relative mb-4 h-24 w-24 overflow-hidden rounded-full border-4 cursor-pointer'
          onClick={() => !uploadAvatarMutation.isPending && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {user.avatar ? (
            <img
              src={user.avatar || '/placeholder.svg'}
              alt={`${user.firstName} ${user.lastName}`}
              className='object-cover h-full w-full'
            />
          ) : (
            <div className='from-primary to-primary/70 flex h-full w-full items-center justify-center bg-gradient-to-br'>
              <span className='text-2xl font-bold text-white'>{getInitials()}</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
            {uploadAvatarMutation.isPending ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </div>
        </div>
        <h3 className='text-center text-lg font-bold'>
          {user.firstName} {user.lastName}
        </h3>

        {/* Membership Tier Badge */}
        {user.role === 'customer' && user.totalSpent !== undefined && (
          <div className='mt-3 w-full'>
            {(() => {
              const tier = calculateMembershipTier(user.totalSpent)
              const tierConfig = getMembershipTierConfig(tier)
              return (
                <div
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${tierConfig.bgColor} ${tierConfig.color}`}
                >
                  {tierConfig.label}
                </div>
              )
            })()}
          </div>
        )}

        <p className='text-foreground/60 mt-2 text-sm'>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
      </div>

      {/* Navigation Tabs */}
      <nav className='space-y-2'>
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-300 ${isActive
                ? 'bg-primary text-white shadow-lg'
                : 'text-foreground/70 hover:bg-card-foreground/5 hover:text-foreground'
                }`}
            >
              <IconComponent className='h-5 w-5' />
              <span className='text-sm'>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Additional Info */}
      <div className='border-border/50 mt-8 space-y-3 border-t pt-6 text-sm'>
        <div>
          <p className='text-foreground/60'>Email</p>
          <p className='text-foreground truncate font-medium'>{user.email}</p>
        </div>
        <div>
          <p className='text-foreground/60'>Điện thoại</p>
          <p className='text-foreground font-medium'>{user.phone}</p>
        </div>
      </div>
    </aside>
  )
}

export default ProfileSidebar

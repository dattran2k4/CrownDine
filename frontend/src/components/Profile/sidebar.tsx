'use client'

import type { User } from '@/types/profile.type'
import { User as UserIcon, Clock, Lock } from 'lucide-react'
import { calculateMembershipTier, getMembershipTierConfig } from '@/lib/membership_tier'

interface ProfileSidebarProps {
  user: User
  activeTab: string
  onTabChange: (tabId: string) => void
}

const ProfileSidebar = ({ user, activeTab, onTabChange }: ProfileSidebarProps) => {
  const tabs = [
    { id: 'info', label: 'My Information', icon: UserIcon },
    { id: 'reservations', label: 'Reservation History', icon: Clock },
    { id: 'security', label: 'Password & Security', icon: Lock }
  ]
  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }
  return (
    <aside className='bg-card border-border sticky top-20 h-fit w-full rounded-lg border p-6'>
      {/* Avatar Section */}
      <div className='mb-8 flex flex-col items-center'>
        <div className='border-primary bg-primary/10 relative mb-4 h-24 w-24 overflow-hidden rounded-full border-4'>
          {user.avatar ? (
            <img
              src={user.avatar || '/placeholder.svg'}
              alt={`${user.firstName} ${user.lastName}`}
              className='object-cover'
            />
          ) : (
            <div className='from-primary to-primary/70 flex h-full w-full items-center justify-center bg-gradient-to-br'>
              <span className='text-2xl font-bold text-white'>{getInitials()}</span>
            </div>
          )}
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
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-300 ${
                isActive
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
          <p className='text-foreground/60'>Phone</p>
          <p className='text-foreground font-medium'>{user.phone}</p>
        </div>
      </div>
    </aside>
  )
}

export default ProfileSidebar

'use client'

import React, { useState } from 'react'
import { mockCurrentUser } from '@/lib/mock-user'
import ProfileSidebar from '@/components/Profile/sidebar'
import ProfileInfo from '@/components/Profile/profile-info'
import ReservationHistory from '@/components/Profile/reservation-history'
import MyVouchers from '@/components/Profile/my-vouchers'
import ProfileFavorites from '@/components/Profile/ProfileFavorites'
import SecuritySettings from '@/components/Profile/security-setting'
import RewardPointsTab from '@/components/Profile/reward-points'
import userVoucherApi from '@/apis/userVoucher.api'
import { useAuthStore } from '@/stores/useAuthStore'
import type { User } from '@/types/profile.type'
import { useQuery } from '@tanstack/react-query'
import reservationApi from '@/apis/reservation.api'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info')
  const authUser = useAuthStore((state) => state.user)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabFromUrl = params.get('tab')
    const validTabs = ['info', 'reservations', 'favorites', 'reward-points', 'vouchers', 'security']
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [])

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['reservation-history'],
    queryFn: () => reservationApi.getReservationHistory({ page: 0, size: 100 }),
    enabled: activeTab === 'reservations'
  })

  const { data: vouchersData, isLoading: isVouchersLoading } = useQuery({
    queryKey: ['my-vouchers'],
    queryFn: () => userVoucherApi.getMyVouchers(),
    enabled: activeTab === 'vouchers'
  })

  const reservations = historyData?.data?.data?.data || []
  const vouchers = vouchersData?.data?.data || []

  // Use local state, initialize with authUser, but also update if authUser changes
  const [user, setUser] = useState<User>((authUser as any) || mockCurrentUser)

  React.useEffect(() => {
    if (authUser) {
      setUser(authUser as any)
    }
  }, [authUser])

  const handleSaveProfile = (updatedData: Partial<User>) => {
    setUser((prev: User) => ({ ...prev, ...updatedData }))
    console.log('[v0] Profile updated:', updatedData)
  }
  return (
    <main className='bg-background min-h-screen py-12'>
      <div className='container mx-auto px-4'>
        {/* Page Header */}
        <div className='mb-12'>
          <h1 className='mb-2 text-4xl font-bold'>My Account</h1>
          <p className='text-foreground/60'>Manage your profile, reservations, and account security</p>
        </div>

        {/* Layout: Sidebar + Main Content */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8'>
          {/* Sidebar - 25% */}
          <div className='md:col-span-1'>
            <ProfileSidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content - 75% */}
          <div className='md:col-span-3'>
            {activeTab === 'info' && <ProfileInfo user={user} onSave={handleSaveProfile} />}

            {activeTab === 'reservations' && (
              <ReservationHistory reservations={reservations as any} isLoading={isHistoryLoading} />
            )}

            {activeTab === 'favorites' && <ProfileFavorites />}

            {activeTab === 'reward-points' && <RewardPointsTab user={user} onUpdateUser={setUser} />}

            {activeTab === 'vouchers' && (
              <MyVouchers vouchers={vouchers} isLoading={isVouchersLoading} />
            )}

            {activeTab === 'security' && <SecuritySettings />}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Profile

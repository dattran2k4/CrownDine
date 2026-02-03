'use client'

import { useState } from 'react'
import { mockCurrentUser, mockReservations } from '@/lib/mock-user'
import ProfileSidebar from '@/components/Profile/sidebar'
import ProfileInfo from '@/components/Profile/profile-info'
import ReservationHistory from '@/components/Profile/reservation-history'
import SecuritySettings from '@/components/Profile/security-setting'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info')
  const [user, setUser] = useState(mockCurrentUser)

  const handleSaveProfile = (updatedData: any) => {
    setUser((prev) => ({ ...prev, ...updatedData }))
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

            {activeTab === 'reservations' && <ReservationHistory reservations={mockReservations} />}

            {activeTab === 'security' && <SecuritySettings />}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Profile

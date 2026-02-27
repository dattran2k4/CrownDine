'use client'

import React from 'react'

import { useState } from 'react'
import type { User } from '@/types/profile.type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MembershipBenefits from './membership-benefits'
import useUpdateProfile from '@/hooks/useUpdateProfile'

interface ProfileInfoProps {
  user: User
  onSave?: (updatedUser: Partial<User>) => void
}
const profile_info = ({ user, onSave }: ProfileInfoProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const formatBackendDate = (dateStr?: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    dateOfBirth: formatBackendDate(user.dateOfBirth),
    gender: (user.gender?.toLowerCase() || 'other') as 'male' | 'female' | 'other'
  })

  React.useEffect(() => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      dateOfBirth: formatBackendDate(user.dateOfBirth),
      gender: (user.gender?.toLowerCase() || 'other') as 'male' | 'female' | 'other'
    })
  }, [user])

  const updateProfileMutation = useUpdateProfile()

  /* Cập nhật dòng này trong file ProfileInfo.tsx của bạn */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    let formattedDate = formData.dateOfBirth
    if (formattedDate && formattedDate.includes('-')) {
      const [year, month, day] = formattedDate.split('-')
      formattedDate = `${day}/${month}/${year}`
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formattedDate,
      gender: formData.gender?.toUpperCase() as any
    }

    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        if (onSave) {
          onSave(formData)
        }
        setIsEditing(false)
      }
    })
  }

  return (
    <div className='bg-card border-border rounded-lg border p-8'>
      {/* Header */}
      <div className='mb-8 flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>My Information</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className='bg-primary hover:bg-primary/90 text-white'>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Form Grid */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* First Name */}
        <div>
          <Label htmlFor='firstName' className='text-sm font-semibold'>
            First Name
          </Label>
          <Input
            id='firstName'
            name='firstName'
            value={formData.firstName}
            onChange={handleChange}
            disabled={!isEditing}
            className='border-border disabled:bg-foreground/5 mt-2 rounded-lg border-2'
          />
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor='lastName' className='text-sm font-semibold'>
            Last Name
          </Label>
          <Input
            id='lastName'
            name='lastName'
            value={formData.lastName}
            onChange={handleChange}
            disabled={!isEditing}
            className='border-border disabled:bg-foreground/5 mt-2 rounded-lg border-2'
          />
        </div>
        {/* Date of Birth */}
        <div>
          <Label htmlFor='dateOfBirth' className='text-sm font-semibold'>
            Date of Birth
          </Label>
          <Input
            id='dateOfBirth'
            name='dateOfBirth'
            type='date'
            value={formData.dateOfBirth}
            onChange={handleChange}
            disabled={!isEditing}
            className='border-border disabled:bg-foreground/5 mt-2 rounded-lg border-2'
          />
        </div>

        {/* Gender */}
        <div>
          <Label htmlFor='gender' className='text-sm font-semibold'>
            Gender
          </Label>
          <select
            id='gender'
            name='gender'
            value={formData.gender}
            /* 1. Sử dụng trực tiếp hàm handleChange của bạn */
            onChange={handleChange}
            disabled={!isEditing}
            /* 2. Style lại để giống với Input của Shadcn UI */
            className='border-border disabled:bg-foreground/5 bg-background focus:border-primary mt-2 block w-full rounded-lg border-2 p-2 text-sm transition-all focus:outline-none'
          >
            <option value='male'>Male</option>
            <option value='female'>Female</option>
            <option value='other'>Other</option>
          </select>
        </div>
      </div>

      {/* Member Since */}
      <div className='border-border/50 mb-8 grid grid-cols-1 gap-6 border-b pb-8 md:grid-cols-2'>
        <div>
          <Label className='text-foreground/70 text-sm font-semibold'>Member Since</Label>
          <p className='text-foreground mt-2 font-medium'>
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div>
          <Label className='text-foreground/70 text-sm font-semibold'>Last Updated</Label>
          <p className='text-foreground mt-2 font-medium'>
            {new Date(user.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className='flex gap-4'>
          <Button onClick={handleSave} disabled={updateProfileMutation.isPending} className='bg-primary hover:bg-primary/90 flex-1 text-white'>
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false)
              setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || 'other'
              })
            }}
            variant='outline'
            className='border-foreground/20 flex-1 border-2'
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Membership Benefits Section */}
      <MembershipBenefits user={user} />
    </div>
  )
}

export default profile_info

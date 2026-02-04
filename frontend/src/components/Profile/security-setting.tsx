'use client'

import React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

interface SecurityTab {
  id: 'password' | 'email' | 'phone'
  label: string
  description: string
}

const SecuritySetting = () => {
  const [activeTab, setActiveTab] = useState<'password' | 'email' | 'phone'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const tabs: SecurityTab[] = [
    {
      id: 'password',
      label: 'Change Password',
      description: 'Update your password to keep your account secure'
    },
    {
      id: 'email',
      label: 'Change Email',
      description: 'Verify your new email address with OTP'
    },
    {
      id: 'phone',
      label: 'Change Phone',
      description: 'Verify your new phone number with OTP'
    }
  ]

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    otp: ''
  })

  const [phoneForm, setPhoneForm] = useState({
    newPhone: '',
    otp: ''
  })

  const handlePasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPhoneForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSendOTP = async (type: 'email' | 'phone') => {
    setIsLoading(true)
    // Simulate OTP sending
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setOtpSent(true)
    setIsLoading(false)
    console.log(`[v0] OTP sent to ${type}`)
  }

  const handleVerifyOTP = async (type: 'email' | 'phone') => {
    setIsLoading(true)
    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setOtpVerified(true)
    setIsLoading(false)
    console.log(`[v0] OTP verified for ${type}`)
  }

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      console.log('[v0] Passwords do not match')
      return
    }
    setIsLoading(true)
    // Simulate password change
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    console.log('[v0] Password changed successfully')
  }
  return (
    <div className='bg-card border-border rounded-lg border p-8'>
      {/* Header */}
      <h2 className='mb-2 text-2xl font-bold'>Password & Security</h2>
      <p className='text-foreground/60 mb-8'>Manage your account security and personal information</p>

      {/* Tabs */}
      <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setOtpSent(false)
              setOtpVerified(false)
            }}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              activeTab === tab.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <h3 className='mb-1 font-semibold'>{tab.label}</h3>
            <p className='text-foreground/60 text-sm'>{tab.description}</p>
          </button>
        ))}
      </div>

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className='max-w-md space-y-6'>
          <div>
            <Label htmlFor='currentPassword' className='text-sm font-semibold'>
              Current Password
            </Label>
            <div className='relative mt-2'>
              <Input
                id='currentPassword'
                name='currentPassword'
                type='password'
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder='Enter your current password'
                className='border-border rounded-lg border-2 pr-10'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='newPassword' className='text-sm font-semibold'>
              New Password
            </Label>
            <div className='relative mt-2'>
              <Input
                id='newPassword'
                name='newPassword'
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder='Enter your new password'
                className='border-border rounded-lg border-2 pr-10'
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className='text-foreground/60 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              >
                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
            <p className='text-foreground/60 mt-1 text-xs'>
              At least 8 characters, including uppercase, lowercase, and numbers
            </p>
          </div>

          <div>
            <Label htmlFor='confirmPassword' className='text-sm font-semibold'>
              Confirm New Password
            </Label>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder='Confirm your new password'
              className='border-border mt-2 rounded-lg border-2'
            />
          </div>

          <Button
            onClick={handlePasswordSubmit}
            disabled={isLoading}
            className='bg-primary hover:bg-primary/90 w-full text-white'
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className='max-w-md space-y-6'>
          <div>
            <Label htmlFor='newEmail' className='text-sm font-semibold'>
              New Email Address
            </Label>
            <Input
              id='newEmail'
              name='newEmail'
              type='email'
              value={emailForm.newEmail}
              onChange={handleEmailChange}
              placeholder='Enter your new email'
              className='border-border mt-2 rounded-lg border-2'
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <Button
              onClick={() => handleSendOTP('email')}
              disabled={isLoading || !emailForm.newEmail}
              className='bg-primary hover:bg-primary/90 w-full text-white'
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          ) : (
            <>
              <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20'>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  An OTP has been sent to your new email address
                </p>
              </div>

              {!otpVerified && (
                <>
                  <div>
                    <Label htmlFor='emailOtp' className='text-sm font-semibold'>
                      Enter OTP
                    </Label>
                    <Input
                      id='emailOtp'
                      name='otp'
                      value={emailForm.otp}
                      onChange={handleEmailChange}
                      placeholder='Enter 6-digit OTP'
                      className='border-border mt-2 rounded-lg border-2'
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={() => handleVerifyOTP('email')}
                    disabled={isLoading || emailForm.otp.length !== 6}
                    className='bg-primary hover:bg-primary/90 w-full text-white'
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </>
              )}

              {otpVerified && (
                <div className='flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/20'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400' />
                  <p className='text-sm text-green-700 dark:text-green-300'>Email verified successfully!</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Phone Tab */}
      {activeTab === 'phone' && (
        <div className='max-w-md space-y-6'>
          <div>
            <Label htmlFor='newPhone' className='text-sm font-semibold'>
              New Phone Number
            </Label>
            <Input
              id='newPhone'
              name='newPhone'
              type='tel'
              value={phoneForm.newPhone}
              onChange={handlePhoneChange}
              placeholder='+1 (555) 000-0000'
              className='border-border mt-2 rounded-lg border-2'
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <Button
              onClick={() => handleSendOTP('phone')}
              disabled={isLoading || !phoneForm.newPhone}
              className='bg-primary hover:bg-primary/90 w-full text-white'
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          ) : (
            <>
              <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20'>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  An OTP has been sent to your new phone number
                </p>
              </div>

              {!otpVerified && (
                <>
                  <div>
                    <Label htmlFor='phoneOtp' className='text-sm font-semibold'>
                      Enter OTP
                    </Label>
                    <Input
                      id='phoneOtp'
                      name='otp'
                      value={phoneForm.otp}
                      onChange={handlePhoneChange}
                      placeholder='Enter 6-digit OTP'
                      className='border-border mt-2 rounded-lg border-2'
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={() => handleVerifyOTP('phone')}
                    disabled={isLoading || phoneForm.otp.length !== 6}
                    className='bg-primary hover:bg-primary/90 w-full text-white'
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </>
              )}

              {otpVerified && (
                <div className='flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/20'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400' />
                  <p className='text-sm text-green-700 dark:text-green-300'>Phone number verified successfully!</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SecuritySetting

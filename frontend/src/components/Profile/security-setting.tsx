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
      label: 'Đổi Mật Khẩu',
      description: 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn'
    },
    {
      id: 'email',
      label: 'Đổi Email',
      description: 'Xác minh địa chỉ email mới bằng mã OTP'
    },
    {
      id: 'phone',
      label: 'Đổi Số Điện Thoại',
      description: 'Xác minh số điện thoại mới bằng mã OTP'
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
      <h2 className='mb-2 text-2xl font-bold'>Mật Khẩu & Bảo Mật</h2>
      <p className='text-foreground/60 mb-8'>Quản lý bảo mật tài khoản và thông tin cá nhân</p>

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
              Mật Khẩu Hiện Tại
            </Label>
            <div className='relative mt-2'>
              <Input
                id='currentPassword'
                name='currentPassword'
                type='password'
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder='Nhập mật khẩu hiện tại'
                className='border-border rounded-lg border-2 pr-10'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='newPassword' className='text-sm font-semibold'>
              Mật Khẩu Mới
            </Label>
            <div className='relative mt-2'>
              <Input
                id='newPassword'
                name='newPassword'
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder='Nhập mật khẩu mới'
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
              Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
            </p>
          </div>

          <div>
            <Label htmlFor='confirmPassword' className='text-sm font-semibold'>
              Xác Nhập Mật Khẩu Mới
            </Label>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder='Nhập lại mật khẩu mới'
              className='border-border mt-2 rounded-lg border-2'
            />
          </div>

          <Button
            onClick={handlePasswordSubmit}
            disabled={isLoading}
            className='bg-primary hover:bg-primary/90 w-full text-white'
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập Nhập Mật Khẩu'}
          </Button>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className='max-w-md space-y-6'>
          <div>
            <Label htmlFor='newEmail' className='text-sm font-semibold'>
              Email Mới
            </Label>
            <Input
              id='newEmail'
              name='newEmail'
              type='email'
              value={emailForm.newEmail}
              onChange={handleEmailChange}
              placeholder='Nhập email mới của bạn'
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
              {isLoading ? 'Đang gửi mã...' : 'Gửi Mã OTP'}
            </Button>
          ) : (
            <>
              <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20'>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  Đã gửi mã OTP đến địa chỉ email mới của bạn
                </p>
              </div>

              {!otpVerified && (
                <>
                  <div>
                    <Label htmlFor='emailOtp' className='text-sm font-semibold'>
                      Nhập Mã OTP
                    </Label>
                    <Input
                      id='emailOtp'
                      name='otp'
                      value={emailForm.otp}
                      onChange={handleEmailChange}
                      placeholder='Nhập mã OTP 6 chữ số'
                      className='border-border mt-2 rounded-lg border-2'
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={() => handleVerifyOTP('email')}
                    disabled={isLoading || emailForm.otp.length !== 6}
                    className='bg-primary hover:bg-primary/90 w-full text-white'
                  >
                    {isLoading ? 'Đang xác minh...' : 'Xác Minh OTP'}
                  </Button>
                </>
              )}

              {otpVerified && (
                <div className='flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/20'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400' />
                  <p className='text-sm text-green-700 dark:text-green-300'>Email đã được xác minh thành công!</p>
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
              Số Điện Thoại Mới
            </Label>
            <Input
              id='newPhone'
              name='newPhone'
              type='tel'
              value={phoneForm.newPhone}
              onChange={handlePhoneChange}
              placeholder='VD: 0912345678'
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
              {isLoading ? 'Đang gửi mã...' : 'Gửi Mã OTP'}
            </Button>
          ) : (
            <>
              <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20'>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  Đã gửi mã OTP đến số điện thoại mới của bạn
                </p>
              </div>

              {!otpVerified && (
                <>
                  <div>
                    <Label htmlFor='phoneOtp' className='text-sm font-semibold'>
                      Nhập Mã OTP
                    </Label>
                    <Input
                      id='phoneOtp'
                      name='otp'
                      value={phoneForm.otp}
                      onChange={handlePhoneChange}
                      placeholder='Nhập mã OTP 6 chữ số'
                      className='border-border mt-2 rounded-lg border-2'
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={() => handleVerifyOTP('phone')}
                    disabled={isLoading || phoneForm.otp.length !== 6}
                    className='bg-primary hover:bg-primary/90 w-full text-white'
                  >
                    {isLoading ? 'Đang xác minh...' : 'Xác Minh OTP'}
                  </Button>
                </>
              )}

              {otpVerified && (
                <div className='flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/20'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400' />
                  <p className='text-sm text-green-700 dark:text-green-300'>Số điện thoại đã được xác minh thành công!</p>
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

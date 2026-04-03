'use client'

import React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import useChangePassword from '@/hooks/useChangePassword'
import useSendEmailOtp from '@/hooks/useSendEmailOtp'
import useVerifyEmailOtp from '@/hooks/useVerifyEmailOtp'
import { toast } from 'sonner'

interface SecurityTab {
  id: 'password' | 'email' | 'phone'
  label: string
  description: string
}

const SecuritySetting = () => {
  const [activeTab, setActiveTab] = useState<'password' | 'email' | 'phone'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])
  
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [phoneForm, setPhoneForm] = useState({
    newPhone: '',
    otp: ''
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPhoneForm((prev) => ({ ...prev, [name]: value }))
  }

  const changePasswordMutation = useChangePassword()
  const sendEmailOtpMutation = useSendEmailOtp()
  const verifyEmailOtpMutation = useVerifyEmailOtp()

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }

  const handleSendOTP = async (type: 'email' | 'phone') => {
    if (type === 'email') {
      if (!emailForm.newEmail) {
        toast.error('Vui lòng nhập email mới')
        return
      }
      if (!validateEmail(emailForm.newEmail)) {
        toast.error('Email không đúng định dạng')
        return
      }
      sendEmailOtpMutation.mutate(emailForm.newEmail, {
        onSuccess: () => {
          setOtpSent(true)
          setCountdown(30)
        }
      })
    }
  }

  const handleVerifyOTP = async (type: 'email' | 'phone') => {
    if (type === 'email') {
      if (!emailForm.otp) {
        toast.error('Vui lòng nhập mã OTP')
        return
      }
      verifyEmailOtpMutation.mutate({
        otp: emailForm.otp,
        newEmail: emailForm.newEmail
      }, {
        onSuccess: () => {
          setOtpVerified(true)
          setOtpSent(false)
          setEmailForm({ newEmail: '', otp: '' })
        }
      })
    }
  }

  const handlePasswordSubmit = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu mới không khớp')
      return
    }

    changePasswordMutation.mutate({
      oldPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmNewPassword: passwordForm.confirmPassword
    }, {
      onSuccess: () => {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    })
  }

  return (
    <div className='bg-card border-border rounded-lg border p-8'>
      <h2 className='mb-2 text-2xl font-bold'>Mật Khẩu & Bảo Mật</h2>
      <p className='text-foreground/60 mb-8'>Quản lý bảo mật tài khoản và thông tin cá nhân</p>

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
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder='Nhập mật khẩu hiện tại'
                className='border-border rounded-lg border-2 pr-10'
              />
              <button
                type='button'
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className='text-foreground/60 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              >
                {showCurrentPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
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
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-foreground/60 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              >
                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor='confirmPassword' className='text-sm font-semibold'>
              Xác Nhập Mật Khẩu Mới
            </Label>
            <div className='relative mt-2'>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder='Nhập lại mật khẩu mới'
                className='border-border rounded-lg border-2 pr-10'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='text-foreground/60 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              >
                {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
          </div>

          <Button
            onClick={handlePasswordSubmit}
            disabled={changePasswordMutation.isPending}
            className='bg-primary hover:bg-primary/90 w-full text-white'
          >
            {changePasswordMutation.isPending ? 'Đang cập nhật...' : 'Cập Nhập Mật Khẩu'}
          </Button>
        </div>
      )}

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
              disabled={otpSent || otpVerified}
            />
          </div>

          {!otpSent && !otpVerified && (
            <Button
              onClick={() => handleSendOTP('email')}
              disabled={sendEmailOtpMutation.isPending || !emailForm.newEmail}
              className='bg-primary hover:bg-primary/90 w-full text-white'
            >
              {sendEmailOtpMutation.isPending ? 'Đang gửi mã...' : 'Gửi Mã OTP'}
            </Button>
          )}

          {otpSent && !otpVerified && (
            <>
              <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20'>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  Đã gửi mã OTP đến địa chỉ email hiện tại của bạn. Vui lòng kiểm tra hộp thư.
                </p>
              </div>

              <div>
                <Label htmlFor='emailOtp' className='text-sm font-semibold'>
                  Mã Xác Thực OTP
                </Label>
                <Input
                  id='emailOtp'
                  name='otp'
                  value={emailForm.otp}
                  onChange={handleEmailChange}
                  placeholder='Nhập mã 6 số'
                  className='border-border mt-2 rounded-lg border-2'
                  maxLength={6}
                />
              </div>

              <Button
                onClick={() => handleVerifyOTP('email')}
                disabled={verifyEmailOtpMutation.isPending || emailForm.otp.length !== 6}
                className='bg-primary hover:bg-primary/90 w-full text-white'
              >
                {verifyEmailOtpMutation.isPending ? 'Đang xác thực...' : 'Xác Minh & Cập Nhật'}
              </Button>

              <button
                type='button'
                disabled={countdown > 0 || sendEmailOtpMutation.isPending}
                onClick={() => handleSendOTP('email')}
                className='text-primary hover:text-primary/80 disabled:text-foreground/40 w-full text-center text-sm font-medium transition-colors'
              >
                {countdown > 0 ? `Gửi lại mã OTP sau ${countdown}s` : 'Gửi lại mã OTP'}
              </button>

              <button
                type='button'
                onClick={() => setOtpSent(false)}
                className='text-foreground/60 hover:text-foreground w-full text-center text-sm'
              >
                Thay đổi email khác
              </button>
            </>
          )}

          {otpVerified && (
            <>
              <div className='flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/20'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400' />
                <p className='text-sm text-green-700 dark:text-green-300'> Email đã được cập nhật thành công! </p>
              </div>
              <Button
                variant='outline'
                onClick={() => {
                  setOtpVerified(false)
                  setOtpSent(false)
                  setEmailForm({ newEmail: '', otp: '' })
                }}
                className='w-full border-2'
              >
                Thực hiện thay đổi khác
              </Button>
            </>
          )}
        </div>
      )}

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
          <p className='text-foreground/60 text-sm'> Tính năng đổi số điện thoại đang được phát triển. </p>
        </div>
      )}
    </div>
  )
}

export default SecuritySetting

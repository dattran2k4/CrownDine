import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createStaffSchema, type CreateStaffValues } from '@/utils/auth.schema'
import useCreateStaff from '@/hooks/useCreateStaff'
import { useEffect } from 'react'

interface StaffModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StaffModal({ isOpen, onClose }: StaffModalProps) {
  const createMutation = useCreateStaff()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateStaffValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      // Setup initial default values when modal opens
      reset({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '123456'
      })
    } else {
      reset({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
      })
    }
  }, [isOpen, reset])

  // Watch email changes to dynamically update username
  const emailVal = watch('email')
  useEffect(() => {
    if (emailVal) {
      const parts = emailVal.split('@')
      if (parts.length > 0) {
        setValue('username', parts[0])
      }
    } else {
      setValue('username', '')
    }
  }, [emailVal, setValue])

  const onSubmit = (data: CreateStaffValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Add New Staff Member'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 py-2'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='gap-1/2 grid'>
            <label className='text-sm font-medium'>First Name</label>
            <Input {...register('firstName')} placeholder='e.g. Nguyen Van' />
            {errors.firstName && <span className='text-xs text-red-500'>{errors.firstName.message}</span>}
          </div>
          <div className='gap-1/2 grid'>
            <label className='text-sm font-medium'>Last Name</label>
            <Input {...register('lastName')} placeholder='e.g. A' />
            {errors.lastName && <span className='text-xs text-red-500'>{errors.lastName.message}</span>}
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='gap-1/2 grid'>
            <label className='text-sm font-medium'>Username (Tự động)</label>
            <Input {...register('username')} placeholder='e.g. staff1' readOnly className='bg-muted cursor-not-allowed' />
            {errors.username && <span className='text-xs text-red-500'>{errors.username.message}</span>}
          </div>
          <div className='gap-1/2 grid'>
            <label className='text-sm font-medium'>Password (Mặc định)</label>
            <Input type='password' {...register('password')} placeholder='123456' readOnly className='bg-muted cursor-not-allowed' />
            {errors.password && <span className='text-xs text-red-500'>{errors.password.message}</span>}
          </div>
        </div>

        <div className='grid gap-2'>
          <label className='text-sm font-medium'>Email</label>
          <Input type='email' {...register('email')} placeholder='email@example.com' />
          {errors.email && <span className='text-xs text-red-500'>{errors.email.message}</span>}
        </div>
        <div className='grid gap-2'>
          <label className='text-sm font-medium'>Phone</label>
          <Input {...register('phone')} placeholder='0123456789' />
          {errors.phone && <span className='text-xs text-red-500'>{errors.phone.message}</span>}
        </div>
        <div className='grid gap-2'>
          <label className='text-sm font-medium'>Role</label>
          <select disabled className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
            <option>Staff</option>
          </select>
        </div>
        <div className='mt-4 flex justify-end gap-2'>
          <Button type="button" variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding...' : 'Add Staff'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

import React, { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import userApi from '@/apis/user.api'
import type { Voucher } from '@/types/voucher.type'

interface AssignUsersModalProps {
  isOpen: boolean
  onClose: () => void
  voucher: Voucher | null
  onAssign: (voucherId: number, userIds: number[], usageLimit: number, expiredAt: string) => void
  isSubmitting?: boolean
}

export function AssignUsersModal({
  isOpen,
  onClose,
  voucher,
  onAssign,
  isSubmitting = false
}: AssignUsersModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [usageLimit, setUsageLimit] = useState('1')
  const [expiredAt, setExpiredAt] = useState('')

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => userApi.getAllCustomers(),
    enabled: isOpen
  })

  const customers = customersData?.data?.data || []

  const filteredCustomers = customers.filter(c => 
    c.phone?.includes(searchTerm) || 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!voucher) return
    
    const limit = parseInt(usageLimit, 10)
    if (Number.isNaN(limit) || limit < 1 || !expiredAt.trim()) {
      return
    }

    if (selectedUserIds.length === 0) {
      return
    }

    onAssign(voucher.id, selectedUserIds, limit, expiredAt)
  }

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserIds([])
      setSearchTerm('')
      setUsageLimit('1')
      setExpiredAt('')
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
  }

  const toggleUser = (id: number) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    )
  }

  const toggleAllVisible = () => {
    const allVisibleIds = filteredCustomers.map(c => Number(c.id))
    const isAllSelected = allVisibleIds.every(id => selectedUserIds.includes(id))
    
    if (isAllSelected) {
      setSelectedUserIds(prev => prev.filter(id => !allVisibleIds.includes(id)))
    } else {
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...allVisibleIds])))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={voucher ? `Gán voucher "${voucher.code}" cho khách hàng` : 'Gán voucher'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label>Chọn khách hàng</Label>
          <Input 
            placeholder='Tìm theo tên hoặc số điện thoại...' 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='mb-2'
          />
          
          <div className='border rounded-md max-h-[200px] overflow-y-auto p-2'>
            {isLoading ? (
              <div className='text-center py-4 text-sm text-muted-foreground'>Đang tải danh sách khách hàng...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className='text-center py-4 text-sm text-muted-foreground'>Không tìm thấy khách hàng.</div>
            ) : (
              <div className='space-y-1'>
                <div className='flex items-center space-x-2 p-2 hover:bg-accent rounded-sm'>
                  <input 
                    type='checkbox' 
                    checked={filteredCustomers.length > 0 && filteredCustomers.every(c => selectedUserIds.includes(Number(c.id)))}
                    onChange={toggleAllVisible}
                    className='h-4 w-4 rounded border-gray-300'
                  />
                  <span className='text-sm font-medium'>Chọn tất cả</span>
                </div>
                {filteredCustomers.map((customer) => (
                  <label key={customer.id} className='flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer'>
                    <input 
                      type='checkbox' 
                      checked={selectedUserIds.includes(Number(customer.id))}
                      onChange={() => toggleUser(Number(customer.id))}
                      className='h-4 w-4 rounded border-gray-300'
                    />
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium'>{customer.firstName} {customer.lastName}</span>
                      <span className='text-xs text-muted-foreground'>{customer.phone}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedUserIds.length > 0 && (
            <div className='text-xs text-muted-foreground text-right'>
              Đã chọn: {selectedUserIds.length} khách hàng
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='assign-usage-limit'>Giới hạn sử dụng (lần/voucher/người)</Label>
          <Input
            id='assign-usage-limit'
            type='number'
            min={1}
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='assign-expired'>Hết hạn lúc</Label>
          <Input
            id='assign-expired'
            type='datetime-local'
            value={expiredAt}
            onChange={(e) => setExpiredAt(e.target.value)}
            required
          />
        </div>

        <div className='flex justify-end gap-3 pt-4'>
          <Button type='button' variant='outline' onClick={handleClose}>
            Hủy
          </Button>
          <Button type='submit' disabled={isSubmitting || selectedUserIds.length === 0}>
            <Users className='mr-2 h-4 w-4' />
            {isSubmitting ? 'Đang gán...' : 'Gán voucher'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

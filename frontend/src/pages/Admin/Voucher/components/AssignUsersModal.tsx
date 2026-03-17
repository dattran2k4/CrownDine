import React, { useState } from 'react'
import { Users } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
  const [userIdsText, setUserIdsText] = useState('')
  const [usageLimit, setUsageLimit] = useState('1')
  const [expiredAt, setExpiredAt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!voucher) return
    const ids = userIdsText
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1)
    const limit = parseInt(usageLimit, 10)
    if (ids.length === 0 || Number.isNaN(limit) || limit < 1 || !expiredAt.trim()) {
      return
    }
    onAssign(voucher.id, ids, limit, expiredAt)
  }

  React.useEffect(() => {
    if (!isOpen) {
      setUserIdsText('')
      setUsageLimit('1')
      setExpiredAt('')
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={voucher ? `Gán voucher "${voucher.code}" cho khách hàng` : 'Gán voucher'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='assign-user-ids'>ID khách hàng (cách nhau bởi dấu phẩy hoặc khoảng trắng)</Label>
          <textarea
            id='assign-user-ids'
            className='border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none'
            placeholder='VD: 1, 2, 3'
            value={userIdsText}
            onChange={(e) => setUserIdsText(e.target.value)}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='assign-usage-limit'>Giới hạn sử dụng (lần/voucher)</Label>
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
          <Button type='submit' disabled={isSubmitting}>
            <Users className='mr-2 h-4 w-4' />
            {isSubmitting ? 'Đang gán...' : 'Gán voucher'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

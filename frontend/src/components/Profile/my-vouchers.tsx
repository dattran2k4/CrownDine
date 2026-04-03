'use client'

import type { MyVoucherResponse } from '@/types/voucher.type'
import { Ticket, Copy, Tag, Calendar, Hash } from 'lucide-react'
import { formatCurrency } from '@/utils/utils'
import { toast } from 'sonner'

interface MyVouchersProps {
  vouchers: MyVoucherResponse[]
  isLoading?: boolean
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const MyVouchers = ({ vouchers, isLoading }: MyVouchersProps) => {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã copy mã: ${code}`)
  }

  const getDiscountLabel = (v: MyVoucherResponse) => {
    if (v.voucherType === 'PERCENTAGE') {
      const max = v.maxDiscountValue != null ? ` (tối đa ${formatCurrency(Number(v.maxDiscountValue))})` : ''
      return `Giảm ${v.discountValue}%${max}`
    }
    return `Giảm ${formatCurrency(Number(v.discountValue))}`
  }

  if (isLoading) {
    return (
      <div className='bg-card border-border rounded-lg border p-8'>
        <h2 className='mb-8 text-2xl font-bold'>Voucher Của Tôi</h2>
        <div className='flex items-center justify-center py-12'>
          <p className='text-foreground/60 animate-pulse'>Đang tải voucher...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-card border-border rounded-lg border p-8'>
      <h2 className='mb-8 text-2xl font-bold'>Voucher Của Tôi</h2>
      <p className='text-foreground/60 mb-6 text-sm'>
        Các voucher bạn được tặng. Dùng mã khi thanh toán đơn hàng để được giảm giá.
      </p>

      <div className='space-y-4'>
        {vouchers.length === 0 ? (
          <div className='border-border bg-foreground/[0.02] flex flex-col items-center justify-center rounded-lg border border-dashed py-16'>
            <Ticket className='text-foreground/30 mb-4 h-14 w-14' />
            <p className='text-foreground/60 font-medium'>Bạn chưa có voucher nào</p>
            <p className='text-foreground/40 mt-1 text-sm'>Voucher sẽ xuất hiện ở đây khi được gán cho bạn</p>
          </div>
        ) : (
          vouchers.map((v) => (
            <div
              key={v.assignmentId}
              className='border-border hover:bg-foreground/[0.02] flex flex-col gap-4 rounded-lg border p-6 transition-colors sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='flex-1 space-y-3'>
                <h3 className='text-lg font-semibold'>{v.voucherName}</h3>
                <p className='text-primary text-base font-semibold'>{getDiscountLabel(v)}</p>
                {v.description && (
                  <p className='text-foreground/70 text-sm'>{v.description}</p>
                )}
                <div className='flex flex-wrap items-center gap-4 text-sm text-foreground/60'>
                  <span className='flex items-center gap-1.5'>
                    <Hash className='h-4 w-4' />
                    Còn {v.usageLimit != null ? `${Math.max(0, v.usageLimit - v.usageCount)}/${v.usageLimit} lượt` : 'không giới hạn'}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <Calendar className='h-4 w-4' />
                    HSD: {formatDate(v.expiredAt)}
                  </span>
                </div>
              </div>
              <div className='border-border/50 flex shrink-0 flex-col items-start gap-2 border-t pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0'>
                <span className='text-foreground/60 text-xs font-medium'>Mã voucher</span>
                <div className='flex items-center gap-2'>
                  <code className='bg-foreground/10 border-border inline-flex items-center gap-1.5 rounded-md border px-3 py-2 font-mono text-sm font-semibold'>
                    <Tag className='h-4 w-4' />
                    {v.voucherCode}
                  </code>
                  <button
                    type='button'
                    onClick={() => copyCode(v.voucherCode)}
                    className='text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg p-2 transition-colors'
                    title='Copy mã'
                  >
                    <Copy className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyVouchers

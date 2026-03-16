import voucherApi from '@/apis/voucher.api'
import type { VoucherValidateResponse } from '@/types/voucher.type'
import { useMutation } from '@tanstack/react-query'
import { Loader2, TicketPercent } from 'lucide-react'
import { useState } from 'react'

interface Props {
  orderId?: number
  disabled?: boolean
  onPreviewChange: (preview: VoucherValidateResponse | null) => void
}

export default function VoucherInput({ orderId, disabled = false, onPreviewChange }: Props) {
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherPreview, setVoucherPreview] = useState<VoucherValidateResponse | null>(null)

  const validateVoucherMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!orderId) {
        throw new Error('Đơn hàng chưa sẵn sàng để kiểm tra voucher.')
      }

      const response = await voucherApi.validateVoucher({
        code,
        orderId
      })

      return response.data.data
    },
    onSuccess: (data) => {
      setVoucherPreview(data)
      setVoucherCode(data.code)
      onPreviewChange(data)
    },
    onError: (error) => {
      console.error('Failed to validate voucher:', error)
      setVoucherPreview(null)
      onPreviewChange(null)
    }
  })

  const handleValidateVoucher = () => {
    const normalizedCode = voucherCode.trim()

    if (!normalizedCode) {
      alert('Vui lòng nhập mã voucher.')
      return
    }

    if (!orderId) {
      alert('Đơn hàng chưa sẵn sàng để kiểm tra voucher.')
      return
    }

    validateVoucherMutation.mutate(normalizedCode)
  }

  const handleVoucherCodeChange = (value: string) => {
    setVoucherCode(value)
    if (voucherPreview) {
      setVoucherPreview(null)
      onPreviewChange(null)
    }
  }

  return (
    <div className='border-t border-gray-200 bg-white p-6'>
      <div className='mb-4 flex items-center gap-2'>
        <TicketPercent className='text-orange-500' size={20} />
        <div>
          <h4 className='text-sm font-semibold text-gray-700 uppercase'>Mã ưu đãi</h4>
          <p className='text-xs text-gray-500'>Nhập voucher để xem trước mức giảm giá trước khi xác nhận thanh toán.</p>
        </div>
      </div>

      <div className='flex flex-col gap-3 md:flex-row'>
        <input
          value={voucherCode}
          onChange={(event) => handleVoucherCodeChange(event.target.value.toUpperCase())}
          placeholder='Nhập mã voucher'
          className='flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium tracking-wide text-gray-900 transition outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
        />
        <button
          type='button'
          onClick={handleValidateVoucher}
          disabled={validateVoucherMutation.isPending || disabled}
          className='inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-70'
        >
          {validateVoucherMutation.isPending ? (
            <span className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' /> Đang kiểm tra...
            </span>
          ) : (
            'Áp dụng'
          )}
        </button>
      </div>

      {voucherPreview && (
        <div className='mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4'>
          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-sm font-semibold text-emerald-800'>Đã tìm thấy voucher phù hợp</p>
              <p className='mt-1 text-lg font-bold text-emerald-900'>
                {voucherPreview.name} <span className='text-sm font-semibold'>({voucherPreview.code})</span>
              </p>
            </div>
            <div className='rounded-xl bg-white px-4 py-3 text-right shadow-sm'>
              <span className='text-xs font-semibold tracking-wide text-emerald-600 uppercase'>Bạn tiết kiệm</span>
              <p className='mt-1 text-2xl font-black text-emerald-700'>
                -
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  voucherPreview.discountAmount
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

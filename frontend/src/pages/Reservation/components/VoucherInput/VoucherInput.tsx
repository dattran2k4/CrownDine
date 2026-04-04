import voucherApi from '@/apis/voucher.api'
import userVoucherApi from '@/apis/userVoucher.api'
import type { VoucherValidateRequest, VoucherValidateResponse } from '@/types/voucher.type'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2, TicketPercent, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface Props {
  orderId?: number
  disabled?: boolean
  onPreviewChange: (preview: VoucherValidateResponse | null) => void
}

export default function VoucherInput({ orderId, disabled = false, onPreviewChange }: Props) {
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherPreview, setVoucherPreview] = useState<VoucherValidateResponse | null>(null)
  const [validatingCode, setValidatingCode] = useState('')

  const { data: myVouchersResponse, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ['my-vouchers'],
    queryFn: () => userVoucherApi.getMyVouchers(),
    enabled: !disabled
  })

  const myVouchers = myVouchersResponse?.data?.data || []

  const { mutate: validateVoucher, isPending: isValidatingVoucher } = useMutation({
    mutationFn: (body: VoucherValidateRequest) => voucherApi.validateVoucher(body),
    onMutate: (variables) => {
      setValidatingCode(variables.code.trim().toUpperCase())
    },
    onSuccess: (response) => {
      const data = response.data.data
      setVoucherPreview(data)
      setVoucherCode(data.code)
      onPreviewChange(data)
      setValidatingCode('')
    },
    onError: () => {
      setVoucherPreview(null)
      onPreviewChange(null)
      setVoucherCode('')
      setValidatingCode('')
    }
  })

  const handleValidateVoucher = (codeToValidate?: string) => {
    const code = (codeToValidate || voucherCode).trim().toUpperCase()

    if (!code) {
      toast.error('Vui lòng chọn mã voucher.')
      return
    }

    if (!orderId) {
      toast.error('Đơn hàng chưa sẵn sàng để kiểm tra voucher.')
      return
    }

    if (voucherPreview?.code?.toUpperCase() === code) {
      setVoucherCode(code)
      return
    }

    if (isValidatingVoucher && validatingCode === code) {
      return
    }

    validateVoucher({
      code,
      orderId
    })
  }

  const handleClearVoucher = () => {
    setVoucherCode('')
    setVoucherPreview(null)
    setValidatingCode('')
    onPreviewChange(null)
  }

  return (
    <div className='rounded-2xl border border-gray-200 bg-white shadow-sm p-6 relative transition-all hover:shadow-md'>
      <div className='mb-5 flex items-center gap-4'>
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-inner'>
          <TicketPercent size={24} />
        </div>
        <div>
          <h4 className='text-base font-bold text-gray-900'>Khuyến mãi & Ưu đãi</h4>
          <p className='text-sm text-gray-500 mt-0.5 leading-relaxed'>Ưu tiên chọn nhanh voucher khả dụng của bạn, hoặc nhập tay mã khác nếu cần.</p>
        </div>
      </div>

      <div className='rounded-2xl border border-orange-100 bg-orange-50/40 p-4'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <p className='text-sm font-semibold text-gray-800'>Voucher khả dụng</p>
            <p className='mt-1 text-xs text-gray-500'>Chọn nhanh để hệ thống kiểm tra và áp dụng cho đơn hiện tại.</p>
          </div>
          {voucherCode && !isValidatingVoucher && (
            <button
              type='button'
              onClick={handleClearVoucher}
              className='inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-red-500 hover:border-red-200'
            >
              Gỡ bỏ
            </button>
          )}
        </div>

        <div className='mt-4'>
          {isLoadingVouchers ? (
            <div className='flex items-center justify-center rounded-xl border border-dashed border-orange-200 bg-white/70 p-6 text-orange-600'>
              <Loader2 className='h-5 w-5 animate-spin' />
            </div>
          ) : myVouchers.length === 0 ? (
            <div className='rounded-xl border border-dashed border-gray-200 bg-white/70 p-4 text-sm text-gray-500'>
              Bạn chưa có voucher khả dụng nào. Bạn vẫn có thể nhập tay mã voucher ở bên dưới.
            </div>
          ) : (
            <div className='grid gap-3'>
              {myVouchers.map((v) => {
                const normalizedVoucherCode = v.voucherCode.toUpperCase()
                const isSelected = voucherCode.toUpperCase() === normalizedVoucherCode
                const isAlreadyApplied = voucherPreview?.code?.toUpperCase() === normalizedVoucherCode
                const isCurrentlyValidating = isValidatingVoucher && validatingCode === normalizedVoucherCode

                return (
                  <button
                    key={v.assignmentId}
                    type='button'
                    disabled={disabled || (isValidatingVoucher && !isSelected)}
                    onClick={() => {
                      setVoucherCode(normalizedVoucherCode)
                      handleValidateVoucher(normalizedVoucherCode)
                    }}
                    className={`w-full rounded-xl border px-4 py-4 text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='font-bold text-gray-900'>{v.voucherName}</span>
                          <span className='rounded bg-orange-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-orange-700'>
                            {normalizedVoucherCode}
                          </span>
                        </div>
                        <p className='mt-1 text-sm text-gray-500'>
                          {v.description || 'Voucher khả dụng cho đơn hàng phù hợp điều kiện.'}
                        </p>
                        <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500'>
                          <span>
                            Điều kiện tối thiểu:{' '}
                            {v.minValue
                              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.minValue)
                              : 'Không có'}
                          </span>
                          <span>Đã dùng {v.usageCount}/{v.usageLimit ?? '∞'} lần</span>
                        </div>
                      </div>
                      {isCurrentlyValidating ? (
                        <span className='inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700'>
                          <Loader2 className='h-3.5 w-3.5 animate-spin' />
                          Đang kiểm tra
                        </span>
                      ) : isAlreadyApplied ? (
                        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700'>
                          <CheckCircle2 className='h-3.5 w-3.5' />
                          Đã áp dụng
                        </span>
                      ) : isSelected ? (
                        <span className='inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700'>
                          <CheckCircle2 className='h-3.5 w-3.5' />
                          Đã chọn
                        </span>
                      ) : (
                        <span className='inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600'>
                          Chọn nhanh
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className='mt-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4'>
        <label className='block text-sm font-semibold text-gray-800'>Nhập tay mã voucher</label>
        <p className='mt-1 text-xs text-gray-500'>Dùng khi bạn có mã riêng từ email, chiến dịch hoặc chưa thấy trong danh sách phía trên.</p>
        <div className='mt-3 flex flex-col gap-3 md:flex-row'>
          <input
            type='text'
            value={voucherCode}
            disabled={disabled || isValidatingVoucher}
            onChange={(e) => {
              setVoucherCode(e.target.value.toUpperCase())
              if (voucherPreview) {
                setVoucherPreview(null)
                onPreviewChange(null)
              }
            }}
            placeholder='Nhập mã voucher...'
            className='flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-70'
          />
          <button
            type='button'
            onClick={() => handleValidateVoucher()}
            disabled={disabled || isValidatingVoucher || !voucherCode.trim()}
            className='inline-flex shrink-0 items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isValidatingVoucher ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Đang kiểm tra...
              </span>
            ) : (
              'Áp dụng mã'
            )}
          </button>
        </div>
      </div>

      {voucherPreview && (
        <div className='mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4'>
          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-sm font-semibold text-emerald-800'>Đã áp dụng voucher thành công</p>
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

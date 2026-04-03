import voucherApi from '@/apis/voucher.api'
import userVoucherApi from '@/apis/userVoucher.api'
import type { VoucherValidateRequest, VoucherValidateResponse } from '@/types/voucher.type'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2, TicketPercent, CheckCircle2, Ticket } from 'lucide-react'
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
    <div className='rounded-2xl border border-gray-200 bg-white shadow-sm p-4 relative transition-all hover:shadow-md'>
      <div className='mb-4 flex items-center gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-inner'>
          <TicketPercent size={18} />
        </div>
        <div>
          <h4 className='text-sm font-black text-gray-900 leading-tight'>Khuyến mãi & Ưu đãi</h4>
          <p className='text-[10px] text-gray-500 mt-0.5 leading-tight'>Chọn voucher khả dụng hoặc nhập tay mã mới.</p>
        </div>
      </div>

      <div className='rounded-xl border border-orange-100 bg-orange-50/40 p-3'>
        <div className='flex items-center justify-between gap-2'>
          <div>
            <p className='text-xs font-bold text-gray-800'>Voucher của bạn</p>
            <p className='mt-0.5 text-[9px] text-gray-400'>Hệ thống sẽ tự động kiểm tra.</p>
          </div>
          {voucherCode && !isValidatingVoucher && (
            <button
              type='button'
              onClick={handleClearVoucher}
              className='inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-600 shadow-xs transition-all hover:bg-gray-50 hover:text-red-500 hover:border-red-100'
            >
              Gỡ bỏ
            </button>
          )}
        </div>

        <div className='mt-3'>
          {isLoadingVouchers ? (
            <div className='flex items-center justify-center rounded-lg border border-dashed border-orange-200 bg-white/70 p-4 text-orange-600'>
              <Loader2 className='h-4 w-4 animate-spin' />
            </div>
          ) : myVouchers.length === 0 ? (
            <div className='rounded-lg border border-dashed border-gray-200 bg-white/70 p-3 text-[11px] text-gray-400 leading-tight'>
              Chưa có voucher khả dụng. Bạn có thể nhập tay ở dưới.
            </div>
          ) : (
            <div className='grid gap-2'>
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
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-xs'
                        : 'border-gray-100 bg-white hover:border-orange-200 shadow-xs'
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-center gap-1.5'>
                          <span className='text-[11px] font-black text-gray-900'>{v.voucherName}</span>
                          <span className='rounded-sm bg-orange-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-orange-700'>
                            {normalizedVoucherCode}
                          </span>
                        </div>
                        <p className='mt-0.5 text-[10px] text-gray-400 line-clamp-1 italic'>
                          {v.description || 'Ưu đãi cho thực đơn.'}
                        </p>
                      </div>
                      <div className='shrink-0'>
                        {isCurrentlyValidating ? (
                            <Loader2 className='h-3.5 w-3.5 animate-spin text-orange-600' />
                        ) : isAlreadyApplied ? (
                            <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600' />
                        ) : isSelected ? (
                            <CheckCircle2 className='h-3.5 w-3.5 text-orange-600' />
                        ) : (
                            <Ticket className='h-3.5 w-3.5 text-gray-200' />
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className='mt-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3'>
        <label className='block text-[11px] font-bold text-gray-700 uppercase tracking-tight'>Nhập mã voucher</label>
        <div className='mt-2 flex flex-col gap-2'>
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
            placeholder='MÃ VOUCHER...'
            className='w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-gray-800 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-500/5 disabled:opacity-70'
          />
          <button
            type='button'
            onClick={() => handleValidateVoucher()}
            disabled={disabled || isValidatingVoucher || !voucherCode.trim()}
            className='w-full rounded-lg bg-orange-500 py-2.5 text-xs font-black text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 shadow-sm'
          >
            {isValidatingVoucher ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-3.5 w-3.5 animate-spin' /> Đang kiểm tra...
              </span>
            ) : (
              'Áp dụng mã'
            )}
          </button>
        </div>
      </div>

      {voucherPreview && (
        <div className='mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 animate-in fade-in zoom-in-95 duration-300'>
          <div className='flex items-center justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <p className='text-[10px] font-bold text-emerald-800 uppercase tracking-tighter'>CẬP NHẬT ƯU ĐÃI</p>
              <p className='mt-0.5 text-xs font-black text-emerald-900 truncate'>
                {voucherPreview.name}
              </p>
            </div>
            <div className='shrink-0 text-right'>
              <span className='text-[9px] font-bold tracking-wide text-emerald-500 uppercase'>Tiết kiệm</span>
              <p className='text-base font-black text-emerald-700'>
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

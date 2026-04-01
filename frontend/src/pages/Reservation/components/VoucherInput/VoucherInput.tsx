import voucherApi from '@/apis/voucher.api'
import userVoucherApi from '@/apis/userVoucher.api'
import type { VoucherValidateRequest, VoucherValidateResponse } from '@/types/voucher.type'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2, TicketPercent, CheckCircle2, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Modal } from '@/components/ui/modal'

interface Props {
  orderId?: number
  disabled?: boolean
  onPreviewChange: (preview: VoucherValidateResponse | null) => void
}

export default function VoucherInput({ orderId, disabled = false, onPreviewChange }: Props) {
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherPreview, setVoucherPreview] = useState<VoucherValidateResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Lấy danh sách voucher khả dụng
  const { data: myVouchersResponse, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ['my-vouchers'],
    queryFn: () => userVoucherApi.getMyVouchers(),
    enabled: isModalOpen // Chỉ fetch khi mở modal
  })

  const myVouchers = myVouchersResponse?.data?.data || []

  const { mutate: validateVoucher, isPending: isValidatingVoucher } = useMutation({
    mutationFn: (body: VoucherValidateRequest) => voucherApi.validateVoucher(body),
    onSuccess: (response) => {
      const data = response.data.data
      setVoucherPreview(data)
      setVoucherCode(data.code)
      onPreviewChange(data)
    },
    onError: () => {
      setVoucherPreview(null)
      onPreviewChange(null)
      setVoucherCode('')
    }
  })

  const handleValidateVoucher = (codeToValidate?: string) => {
    const code = (codeToValidate || voucherCode).trim()

    if (!code) {
      toast.error('Vui lòng chọn mã voucher.')
      return
    }

    if (!orderId) {
      toast.error('Đơn hàng chưa sẵn sàng để kiểm tra voucher.')
      return
    }

    validateVoucher({
      code: code,
      orderId
    })
  }

  const handleClearVoucher = () => {
    setVoucherCode('')
    setVoucherPreview(null)
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
          <p className='text-sm text-gray-500 mt-0.5 leading-relaxed'>Áp dụng các mã giảm giá hệ thống tặng để tiết kiệm chi phí.</p>
        </div>
      </div>

      <div className='flex flex-col gap-3 md:flex-row'>
        <button
          type='button'
          onClick={() => setIsModalOpen(true)}
          disabled={disabled || isValidatingVoucher}
          className='group flex-1 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-5 py-4 text-left font-medium tracking-wide text-gray-700 transition-all hover:border-orange-500 hover:bg-orange-50 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-70 disabled:cursor-not-allowed'
        >
          <div className="flex items-center gap-3">
            {isValidatingVoucher ? (
              <span className='flex items-center gap-3 text-orange-600'>
                <Loader2 className='h-5 w-5 animate-spin' /> Đang kiểm tra mã...
              </span>
            ) : voucherCode ? (
              <span className="flex items-center gap-2.5 font-bold text-orange-600 text-base">
                <CheckCircle2 className="h-5 w-5" /> 
                <span className="uppercase tracking-wider">Mã đã chọn: {voucherCode}</span>
              </span>
            ) : (
              <span className="text-gray-500 text-sm group-hover:text-orange-600 font-semibold transition-colors">
                Nhấn để chọn mã ưu đãi khả dụng...
              </span>
            )}
          </div>
          {!isValidatingVoucher && !voucherCode && (
             <ChevronRight className='h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors' />
          )}
        </button>

        {voucherCode && !isValidatingVoucher && (
          <button
            type='button'
            onClick={handleClearVoucher}
            className='inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-red-500 hover:border-red-200'
          >
            Gỡ bỏ
          </button>
        )}
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

      {/* Modal Chọn Voucher */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title='Chọn Mã Ưu Đãi' maxWidth="max-w-lg">
        <div className='flex flex-col gap-3 pb-4'>
          {isLoadingVouchers ? (
            <div className='flex justify-center p-8'><Loader2 className='h-8 w-8 animate-spin text-orange-500' /></div>
          ) : myVouchers.length === 0 ? (
            <div className='text-center py-10'>
              <div className="bg-orange-100 text-orange-600 rounded-full h-16 w-16 mx-auto flex items-center justify-center mb-3">
                <TicketPercent size={32} />
              </div>
              <p className='text-gray-500 font-medium'>Bạn chưa có mã ưu đãi nào.</p>
            </div>
          ) : (
            myVouchers.map((v) => (
              <div key={v.assignmentId} className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-sm'>
                <div className="flex-1">
                  <h4 className='font-bold text-gray-800'>
                    {v.voucherName} 
                    <span className='inline-block text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded ml-2 align-middle'>
                      {v.voucherCode}
                    </span>
                  </h4>
                  <p className='text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2'>{v.description || 'Không có mô tả cho voucher này'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVoucherCode(v.voucherCode)
                    setIsModalOpen(false)
                    handleValidateVoucher(v.voucherCode)
                  }}
                  className='shrink-0 rounded-lg bg-orange-500 px-5 py-2 text-sm font-bold tracking-wide text-white transition hover:bg-orange-600 focus:ring-2 focus:ring-orange-300 focus:outline-none'
                >
                  Sử dụng
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}

import CountdownTimer from '@/pages/Reservation/components/CountdownTimer'
import { RESTAURANT_CONFIG, type Table } from '@/pages/Reservation/data'
import { addMinutesToTime, formatCurrency } from '@/utils/utils'
import { CreditCard, Info, XCircle } from 'lucide-react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface Props {
  userInfo: { name: string; phone: string; email: string; gender: string }
  bookingData: {
    date: string
    startTime: string
    duration: number
    guests: number
    selectedTables: Table[]
  }
  cartItems: CartItem[]
  onPay: () => void
  onCancel: () => void
  isProcessing: boolean
}
const Step4Payment = ({ userInfo, bookingData, cartItems, onPay, onCancel, isProcessing }: Props) => {
  const endTime = addMinutesToTime(bookingData.startTime, bookingData.duration)
  const foodTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <div className='animate-fade-in space-y-6'>
      {/* Alert Header & Timer */}
      <div className='flex flex-col items-center justify-between gap-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 md:flex-row'>
        <div className='flex items-center gap-2'>
          <Info className='text-yellow-600' size={20} />
          <span className='text-sm font-medium text-yellow-800'>Vui lòng hoàn tất trong thời gian giữ vé.</span>
        </div>
        <CountdownTimer
          minutes={10}
          onExpire={() => {
            alert('Hết phiên giao dịch! Vui lòng đặt lại.')
            window.location.reload()
          }}
        />
      </div>

      <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b bg-gray-100 px-6 py-3'>
          <h3 className='text-lg font-bold'>Xác nhận thông tin</h3>
          <span className='rounded bg-black/10 px-2 py-1 text-[10px] font-bold text-black/60 uppercase'>Read Only</span>
        </div>

        <div className='grid grid-cols-1 gap-x-12 gap-y-8 p-6 md:grid-cols-2'>
          {/* Cột 1: Thông tin khách hàng */}
          <div className='space-y-4'>
            <h4 className='border-b pb-1 text-xs font-bold tracking-wider text-gray-400 uppercase'>Khách hàng</h4>
            <div className='flex items-start gap-3'>
              <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold'>
                {userInfo.name.charAt(0)}
              </div>
              <div>
                <p className='font-bold text-gray-900'>
                  {userInfo.name} <span className='text-xs font-normal text-gray-500'>({userInfo.gender})</span>
                </p>
                <p className='text-sm text-gray-600'>{userInfo.phone}</p>
                <p className='text-sm text-gray-600'>{userInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Cột 2: Chi tiết đặt bàn */}
          <div className='space-y-4'>
            <h4 className='border-b pb-1 text-xs font-bold tracking-wider text-gray-400 uppercase'>Chi tiết đặt chỗ</h4>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='block text-xs text-gray-500'>Ngày</span>
                <span className='font-medium text-gray-900'>{bookingData.date}</span>
              </div>
              <div>
                <span className='block text-xs text-gray-500'>Thời gian ({bookingData.duration}p)</span>
                <span className='text-primary font-bold'>
                  {bookingData.startTime} - {endTime}
                </span>
              </div>
              <div>
                <span className='block text-xs text-gray-500'>Số khách</span>
                <span className='font-medium text-gray-900'>{bookingData.guests} Người</span>
              </div>
              <div>
                <span className='block text-xs text-gray-500'>Vị trí bàn</span>
                <span className='font-bold text-gray-900'>
                  {bookingData.selectedTables.map((t) => t.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phần Payment Breakdown */}
        <div className='space-y-3 border-t border-dashed bg-gray-50 p-6'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Phí đặt cọc (Deposit)</span>
            <span className='font-bold'>{formatCurrency(RESTAURANT_CONFIG.depositAmount)}</span>
          </div>

          {foodTotal > 0 && (
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Món ăn đặt trước (Thanh toán sau)</span>
              <span>{formatCurrency(foodTotal)}</span>
            </div>
          )}

          <div className='mt-2 flex items-center justify-between border-t border-gray-200 pt-4'>
            <div>
              <span className='block text-lg font-bold'>Tổng thanh toán ngay</span>
              <span className='text-xs text-gray-500 italic'>Đã bao gồm VAT & Phí dịch vụ</span>
            </div>
            <span className='text-primary text-2xl font-bold'>{formatCurrency(RESTAURANT_CONFIG.depositAmount)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4 pt-2'>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className='flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-red-100 px-6 py-3 font-bold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50'
        >
          <XCircle size={20} /> Huỷ bỏ
        </button>
        <button
          onClick={onPay}
          disabled={isProcessing}
          className='bg-foreground flex flex-2 items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-black/90 hover:shadow-xl disabled:cursor-wait disabled:opacity-70'
        >
          {isProcessing ? (
            <span className='flex items-center gap-2'>
              <span className='loading-spinner' /> Đang xử lý...
            </span>
          ) : (
            <>
              <CreditCard size={20} /> Thanh toán & Xác nhận
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Step4Payment

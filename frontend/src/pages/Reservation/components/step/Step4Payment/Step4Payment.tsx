import { RESTAURANT_CONFIG, type Table } from '@/pages/Reservation/data'
import { formatCurrency } from '@/utils/utils'
import { CreditCard, XCircle, Utensils, Loader2, Info } from 'lucide-react'
import type { OrderDetailResponse } from '@/types/reservation.type'
import CountdownTimer from '@/pages/Reservation/components/CountdownTimer'

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
    endTime: string
    duration: number
    guests: number
    selectedTables: Table[]
  }
  cartItems: CartItem[]
  onPay: () => void
  onCancel: () => void
  isProcessing: boolean
  orderDetails: OrderDetailResponse | null
  isLoadingOrderDetails: boolean
  expiratedAt: string | null
}
const Step4Payment = ({ userInfo, bookingData, cartItems, onPay, onCancel, isProcessing, orderDetails, isLoadingOrderDetails, expiratedAt }: Props) => {
  const foodTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
  
  // Sử dụng dữ liệu từ API nếu có, nếu không thì tính từ local state
  const itemsTotal = orderDetails?.itemsTotal ?? foodTotal
  const tableDeposit = orderDetails?.tableDeposit ?? RESTAURANT_CONFIG.depositAmount
  
  // Tính depositAmount: nếu có orderDetails thì dùng từ API, nếu không thì tính = 20% món + cọc bàn
  const depositAmount = orderDetails?.depositAmount ?? (itemsTotal * 0.2 + tableDeposit)
  
  // Tính cọc 20% món ăn
  const foodDeposit = itemsTotal * 0.2
  
  // Tính số tiền còn lại (80% món ăn)
  const remainingAmount = orderDetails?.remainingAmount ?? (itemsTotal * 0.8)

  if (isLoadingOrderDetails) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='flex flex-col items-center gap-4 text-gray-400'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p>Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='animate-fade-in space-y-6'>
      {/* Alert Header & Timer */}
      {expiratedAt && (
        <div className='rounded-lg border border-yellow-300 bg-yellow-50 p-4'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <div className='flex items-center gap-3'>
          <Info className='text-yellow-600' size={20} />
              <span className='text-sm font-medium text-yellow-900'>Vui lòng hoàn tất trong thời gian giữ vé.</span>
        </div>
        <CountdownTimer
              expiratedAt={expiratedAt}
          onExpire={() => {
            alert('Hết phiên giao dịch! Vui lòng đặt lại.')
            window.location.reload()
          }}
        />
      </div>
        </div>
      )}

      <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4'>
          <h3 className='flex items-center gap-2 text-xl font-bold text-gray-900'>
            <CreditCard className='text-orange-500' size={20} />
            Xác nhận thông tin
          </h3>
          <span className='rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600'>
            Read Only
          </span>
        </div>

        <div className='grid grid-cols-1 gap-8 p-6 md:grid-cols-2'>
          {/* Cột 1: Thông tin khách hàng */}
          <div className='space-y-4'>
            <h4 className='border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700 uppercase'>
              Khách hàng
            </h4>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white'>
                {userInfo.name.charAt(0)}
              </div>
              <div className='space-y-1'>
                <p className='font-semibold text-gray-900'>
                  {userInfo.name} <span className='text-xs font-normal text-gray-500'>({userInfo.gender})</span>
                </p>
                <p className='text-sm text-gray-600'>{userInfo.phone}</p>
                <p className='text-sm text-gray-600'>{userInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Cột 2: Chi tiết đặt bàn */}
          <div className='space-y-4'>
            <h4 className='border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700 uppercase'>
              Chi tiết đặt chỗ
            </h4>
            <div className='grid grid-cols-2 gap-3'>
              <div className='rounded-lg bg-gray-50 p-3'>
                <span className='block text-xs text-gray-500 mb-1'>Ngày</span>
                <span className='font-semibold text-gray-900'>{bookingData.date}</span>
              </div>
              <div className='rounded-lg bg-orange-50 p-3'>
                <span className='block text-xs text-gray-600 mb-1'>Thời gian ({bookingData.duration}p)</span>
                <span className='text-orange-600 font-semibold'>
                  {bookingData.startTime} - {bookingData.endTime}
                </span>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <span className='block text-xs text-gray-500 mb-1'>Số khách</span>
                <span className='font-semibold text-gray-900'>{bookingData.guests} Người</span>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <span className='block text-xs text-gray-500 mb-1'>Vị trí bàn</span>
                <span className='font-semibold text-gray-900'>
                  {bookingData.selectedTables.map((t) => t.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phần Món ăn đã chọn */}
        {cartItems.length > 0 && (
          <div className='border-t border-gray-200 bg-orange-50/30 p-6'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase'>
              <Utensils className='h-4 w-4 text-orange-600' />
              Món ăn đã chọn ({cartItems.length})
            </h4>
            <div className='custom-scrollbar max-h-64 space-y-2 overflow-y-auto'>
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.name}`}
                  className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3'
                >
                  <div className='flex items-center gap-3'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-xs font-bold text-white'>
                      {item.quantity}x
                    </span>
                    <div>
                      <p className='font-medium text-gray-900 text-sm'>{item.name}</p>
                      <p className='text-xs text-gray-500'>{formatCurrency(item.price)} / phần</p>
                    </div>
                  </div>
                  <span className='font-semibold text-gray-900'>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className='mt-4 flex justify-between rounded-lg bg-white p-4 border border-gray-200'>
              <span className='text-sm font-semibold text-gray-700'>Tổng tiền món ăn:</span>
              <span className='text-lg font-bold text-gray-900'>{formatCurrency(foodTotal)}</span>
            </div>
          </div>
        )}

        {/* Phần Payment Breakdown */}
        <div className='space-y-3 border-t border-gray-200 bg-gray-50 p-6'>
          {itemsTotal > 0 && (
            <>
              <div className='flex justify-between rounded-lg bg-white p-3 text-sm border border-gray-200'>
                <span className='text-gray-700'>Tổng tiền món ăn</span>
                <span className='font-semibold text-gray-900'>{formatCurrency(itemsTotal)}</span>
              </div>
              <div className='flex justify-between rounded-lg bg-amber-50 p-3 text-sm border border-amber-200'>
                <span className='text-gray-700'>Cọc 20% món ăn</span>
                <span className='font-semibold text-amber-700'>{formatCurrency(foodDeposit)}</span>
              </div>
            </>
          )}
          
          <div className='flex justify-between rounded-lg bg-white p-3 text-sm border border-gray-200'>
            <span className='text-gray-700'>Cọc bàn</span>
            <span className='font-semibold text-gray-900'>{formatCurrency(tableDeposit)}</span>
          </div>

          {itemsTotal > 0 && (
            <div className='flex justify-between rounded-lg bg-gray-100 p-3 text-sm'>
              <span className='text-gray-600'>Món ăn còn lại (Thanh toán sau)</span>
              <span className='font-semibold text-gray-700'>{formatCurrency(remainingAmount)}</span>
            </div>
          )}

          <div className='mt-4 flex items-center justify-between rounded-lg border-2 border-orange-200 bg-orange-50 p-5'>
            <div>
              <span className='block text-lg font-bold text-gray-900 mb-1'>Tổng thanh toán ngay</span>
              <span className='text-xs text-gray-600'>Đã bao gồm VAT & Phí dịch vụ</span>
            </div>
            <span className='text-orange-600 text-3xl font-bold'>{formatCurrency(depositAmount)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4 pt-4'>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className='flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50'
        >
          <XCircle size={18} /> Huỷ bỏ
        </button>
        <button
          onClick={onPay}
          disabled={isProcessing}
          className='flex flex-[2] items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-3 font-bold text-white transition-colors hover:bg-orange-600 disabled:cursor-wait disabled:opacity-70'
        >
          {isProcessing ? (
            <span className='flex items-center gap-2'>
              <Loader2 className='h-5 w-5 animate-spin' /> Đang xử lý...
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

import { RESTAURANT_CONFIG } from '@/pages/Reservation/data'
import { formatCurrency } from '@/utils/utils'
import { UtensilsCrossed, Loader2, Info, User, Calendar, Clock, PhoneCall } from 'lucide-react'
import type { ReservationCheckoutResponse } from '@/types/reservation.type'
import { toast } from 'react-toastify'
import type { ReservationTable as Table } from '@/types/reservation.type'
import CountdownTimer from '@/pages/Reservation/components/CountdownTimer'
import type { UserSummary } from '@/types/profile.type'
import type { VoucherValidateResponse } from '@/types/voucher.type'
import VoucherInput from '@/pages/Reservation/components/VoucherInput'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  description?: string
  note?: string
}

interface Props {
  user: UserSummary | null
  bookingData: {
    date: string
    startTime: string
    plannedEndTime: string
    guests: number
    selectedTable: Table | null
  }
  cartItems: CartItem[]
  onPay: () => void
  onCancel: () => void
  isProcessing: boolean
  checkoutSummary: ReservationCheckoutResponse | null
  isLoadingOrderDetails: boolean
  expiratedAt: string | null
  voucherPreview: VoucherValidateResponse | null
  onVoucherPreviewChange: (preview: VoucherValidateResponse | null) => void
}

const Step4Payment = ({
  user,
  bookingData,
  cartItems,
  onPay,
  onCancel,
  isProcessing,
  checkoutSummary,
  isLoadingOrderDetails,
  expiratedAt,
  voucherPreview,
  onVoucherPreviewChange
}: Props) => {
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Khách'
  const phone = user?.phone ?? ''
  const email = user?.email ?? ''
  const foodTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)

  // Sử dụng dữ liệu từ API nếu có, nếu không thì tính từ local state
  const itemsTotal = checkoutSummary?.itemsTotal ?? foodTotal
  const tableDeposit = checkoutSummary?.tableDeposit ?? RESTAURANT_CONFIG.depositAmount
  const previewFinalAmount = voucherPreview?.finalAmount ?? itemsTotal

  // Tính depositAmount: nếu có checkout summary thì dùng từ API, nếu không thì tính = 20% món + cọc bàn
  const depositAmount = checkoutSummary?.depositAmount ?? itemsTotal * 0.2 + tableDeposit
  const discountedFoodDeposit = previewFinalAmount * 0.2

  const discountedPayableNow =
    voucherPreview && depositAmount > 0 ? Math.max(0, discountedFoodDeposit + tableDeposit) : depositAmount

  if (isLoadingOrderDetails) {
    return (
      <div className='min-100 flex items-center justify-center p-12'>
        <div className='flex flex-col items-center gap-4 text-gray-400'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <p className='text-sm'>Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='animate-fade-in space-y-4 pt-1'>
      {/* Expiry Alert Bar - More Compact */}
      {expiratedAt && (
        <div className='rounded-lg border border-orange-200 bg-orange-50/40 px-3 py-2 shadow-sm'>
          <div className='flex flex-col items-center justify-between gap-2 sm:flex-row'>
            <div className='flex items-center gap-2'>
              <Info size={14} className='text-orange-500' />
              <span className='text-[11px] font-semibold text-orange-900'>Vui lòng hoàn tất giao dịch để giữ bàn thành công.</span>
            </div>
            <div className='flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold text-orange-600 shadow-xs'>
                <Clock size={12} />
                <CountdownTimer
                    expiratedAt={expiratedAt}
                    onExpire={() => {
                        toast.error('Hết phiên giao dịch! Vui lòng đặt lại.')
                        window.location.reload()
                    }}
                />
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        {/* Left Side: Forms and Menu (8/12) */}
        <div className='space-y-4 lg:col-span-8'>
          
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Customer Info Section - More Compact */}
            <section className='overflow-hidden rounded-xl border border-border bg-white shadow-sm'>
                <div className='flex items-center gap-2 border-b border-gray-50 bg-gray-50/30 px-5 py-3'>
                    <User size={16} className='text-orange-500' />
                    <h3 className='text-xs font-bold text-gray-900 uppercase tracking-tight'>Thông tin liên hệ</h3>
                </div>
                <div className='space-y-3 p-5'>
                    <div className='flex items-center justify-between'>
                        <span className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Tên khách</span>
                        <span className='text-xs font-semibold text-gray-900'>{fullName}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                        <span className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Số điện thoại</span>
                        <span className='text-xs font-semibold text-gray-900'>{phone}</span>
                    </div>
                    <div className='flex items-center justify-between gap-4'>
                        <span className='text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0'>Email</span>
                        <span className='text-xs font-semibold text-gray-900 truncate'>{email}</span>
                    </div>
                </div>
            </section>

            {/* Table Details Section - More Compact */}
            <section className='overflow-hidden rounded-xl border border-border bg-white shadow-sm'>
                <div className='flex items-center gap-2 border-b border-gray-50 bg-gray-50/30 px-5 py-3'>
                    <Calendar size={16} className='text-orange-500' />
                    <h3 className='text-xs font-bold text-gray-900 uppercase tracking-tight'>Chi tiết đặt bàn</h3>
                </div>
                <div className='space-y-3 p-5'>
                    <div className='flex items-center justify-between'>
                        <span className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Ngày hẹn</span>
                        <span className='text-xs font-semibold text-gray-900'>{bookingData.date}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                        <span className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Thời gian</span>
                        <span className='text-xs font-semibold text-gray-900'>{bookingData.startTime} - {bookingData.plannedEndTime}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                        <span className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Bàn / Chỗ</span>
                        <span className='text-xs font-semibold text-gray-900'>
                            {bookingData.selectedTable?.name ?? '—'}
                            {bookingData.selectedTable?.floorName ? ` (${bookingData.selectedTable.floorName})` : ''}
                        </span>
                    </div>
                </div>
            </section>
          </div>

          {/* Menu Items - Reduced sizes */}
          <section className='space-y-3'>
            <div className='flex items-center gap-2 px-1'>
              <UtensilsCrossed size={16} className='text-orange-500' />
              <h3 className='text-sm font-bold text-gray-900'>Danh sách món đã đặt</h3>
            </div>
            
            <div className='grid grid-cols-1 gap-3'>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.name}`} className='group flex items-center gap-3 rounded-xl border border-border bg-white p-2.5 shadow-xs transition-all hover:border-orange-100'>
                    <div className='h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100'>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className='h-full w-full object-cover transition-transform group-hover:scale-105' />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-gray-200'>
                          <UtensilsCrossed size={18} />
                        </div>
                      )}
                    </div>
                    <div className='flex flex-1 flex-col justify-center min-w-0'>
                      <h4 className='text-xs font-bold text-gray-900 truncate'>{item.name}</h4>
                      {item.note ? (
                        <p className='mt-0.5 text-[10px] italic text-orange-500 line-clamp-1'>“{item.note}”</p>
                      ) : (
                        <p className='mt-0.5 text-[10px] text-gray-400 line-clamp-1 italic'>{item.description || 'Deluxe Dining Signature'}</p>
                      )}
                    </div>
                    <div className='flex flex-col items-end gap-0.5 px-3 border-l border-gray-50 flex-shrink-0'>
                      <span className='text-[9px] font-black text-gray-300 uppercase'>x{item.quantity}</span>
                      <span className='text-xs font-bold text-gray-900 whitespace-nowrap'>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/50 p-10 mt-2'>
                  <UtensilsCrossed size={32} className='mb-3 text-gray-100' />
                  <p className='text-xs font-semibold text-gray-400'>Không có món ăn trong đơn hàng</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Side: Sidebar - Reduced sizes and padding */}
        <aside className='lg:col-span-4'>
          <div className='sticky top-4 flex flex-col gap-4'>
            <div className='rounded-2xl border border-border bg-white p-5 shadow-lg'>
                <h3 className='mb-4 text-sm font-black text-gray-900 uppercase tracking-wider'>Tóm tắt thanh toán</h3>
                
                <div className='space-y-3 border-b border-gray-50 pb-5 text-xs'>
                    <div className='flex justify-between text-gray-500 font-small'>
                        <span>Số lượng ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} món)</span>
                        <span className='font-bold text-gray-900'>{formatCurrency(itemsTotal)}</span>
                    </div>
                    
                    {voucherPreview && (
                        <div className='flex justify-between items-center'>
                            <span className='font-bold text-emerald-300 bg-emerald-50 px-1.5 py-0.5 rounded'>Voucher tiết kiệm</span>
                            <span className='font-black text-emerald-300'>-{formatCurrency(voucherPreview.discountAmount)}</span>
                        </div>
                    )}
                    
                    <div className='flex items-baseline justify-between pt-2 border-t border-gray-50'>
                        <span className='text-xs font-bold text-gray-900 uppercase'>Tổng tiền món</span>
                        <span className='text-xl font-black text-orange-600'>{formatCurrency(previewFinalAmount)}</span>
                    </div>
                </div>

                <div className='py-4'>
                    <VoucherInput
                        orderId={checkoutSummary?.orderId ?? undefined}
                        disabled={isProcessing}
                        onPreviewChange={onVoucherPreviewChange}
                    />
                </div>

                <div className='space-y-3 rounded-2xl bg-orange-50/50 p-4 border border-orange-100 shadow-sm'>
                    <div className='flex items-center gap-1.5 text-[9px] font-black text-orange-800 uppercase tracking-widest'>
                        <Info size={12} className='text-orange-500' />
                        Quy định đặt cọc
                    </div>
                    <p className='text-[10px] leading-relaxed text-orange-900/60 font-semibold'>
                        Khu vực của bạn được xác nhận ngay khi bạn thanh toán tiền cọc tối thiểu.
                    </p>
                    <div className='flex items-center justify-between pt-3 border-t border-orange-200/40'>
                        <span className='text-[9px] font-black text-orange-900'>CỌC CẦN TRẢ:</span>
                        <span className='text-lg font-black text-orange-600'>{formatCurrency(discountedPayableNow)}</span>
                    </div>
                </div>

                <div className='mt-6 space-y-3 font-sans'>
                    <button
                        onClick={onPay}
                        disabled={isProcessing}
                        className='w-full rounded-xl bg-gray-900 py-3.5 text-xs font-black text-white hover:bg-black active:scale-[0.98] disabled:opacity-70 shadow-sm transition-all'
                    >
                        {isProcessing ? (
                            <span className='flex items-center justify-center gap-2'>
                                <Loader2 className='h-4 w-4 animate-spin' /> Đang xử lý...
                            </span>
                        ) : (
                            'Xác nhận & Thanh toán'
                        )}
                    </button>
                    
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className='w-full rounded-xl bg-red-500 py-3.5 text-xs font-black text-white hover:bg-red-600 active:scale-[0.98] disabled:opacity-70 shadow-sm transition-all'
                    >
                        Huỷ quy trình đặt bàn
                    </button>
                </div>
            </div>

            {/* Compact Support */}
            <div className='rounded-xl bg-white border border-border p-3.5 flex items-center gap-3 shadow-sm'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600'>
                    <PhoneCall size={18} />
                </div>
                <div>
                    <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Hỗ trợ đặt bàn</p>
                    <p className='text-sm font-black text-gray-900'>1900 8888</p>
                </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Step4Payment

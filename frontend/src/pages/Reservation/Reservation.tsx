import { useState, useMemo, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { addMinutesToTime, generateTimeSlots, calculateDuration, isDateTimeInPast } from '@/utils/utils'
import { RESTAURANT_CONFIG } from '@/pages/Reservation/data'
import Step1DateTime from '@/pages/Reservation/components/step/Step1DateTime/Step1DateTime'
import Step2TableMap from '@/pages/Reservation/components/step/Step2TableMap/Step2TableMap'
import Step3FoodMenu from '@/pages/Reservation/components/step/Step3FoodMenu'
import Step4Payment from '@/pages/Reservation/components/step/Step4Payment/Step4Payment'
import orderApi from '@/apis/order.api'
import reservationApi from '@/apis/reservation.api'
import paymentApi from '@/apis/payment.api'
import type { CreatePaymentRequest } from '@/apis/payment.api'
import type { PreOrderCartItem, ReservationTable as Table } from '@/types/reservation.type'
import type { OrderDetailResponse } from '@/types/reservation.type'
import type { VoucherValidateResponse } from '@/types/voucher.type'
import { useAuthStore } from '@/stores/useAuthStore'
import Progress from '@/pages/Reservation/components/Progress'
import { setPaymentResultToSession } from '@/utils/paymentResultStorage'

// --- 3. MAIN COMPONENT ---
export default function Reservation() {
  const [currentStep, setCurrentStep] = useState(1)

  // Data State
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('20:00') // 2 tiếng sau startTime mặc định

  // Tính duration từ startTime và endTime
  const duration = useMemo(() => calculateDuration(startTime, endTime), [startTime, endTime])

  // Reset endTime khi startTime thay đổi nếu endTime hiện tại không hợp lệ
  useEffect(() => {
    const closingTimeStr = `${RESTAURANT_CONFIG.closeHour}:00`
    const defaultEndTime = addMinutesToTime(startTime, 120) // 2 giờ mặc định

    // Reset nếu endTime không hợp lệ (nhỏ hơn hoặc bằng startTime, hoặc vượt quá giờ đóng cửa)
    if (endTime <= startTime || endTime > closingTimeStr) {
      // Đảm bảo defaultEndTime không vượt quá giờ đóng cửa
      const validEndTime = defaultEndTime > closingTimeStr ? closingTimeStr : defaultEndTime
      if (validEndTime !== endTime) {
        setEndTime(validEndTime)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime])

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const [cartItems, setCartItems] = useState<PreOrderCartItem[]>([])

  // Reservation state
  const [reservationId, setReservationId] = useState<number | null>(null)
  const [reservationCode, setReservationCode] = useState<string | null>(null)
  const [expiratedAt, setExpiratedAt] = useState<string | null>(null) // Thời gian hết hạn reservation
  const [isCreatingReservation, setIsCreatingReservation] = useState(false)
  const [isPaid] = useState(false) // Đánh dấu đã thanh toán
  const [orderDetails, setOrderDetails] = useState<OrderDetailResponse | null>(null)
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false)
  const [voucherPreview, setVoucherPreview] = useState<VoucherValidateResponse | null>(null)
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null)

  useEffect(() => {
    setVoucherPreview(null)
    setAppliedVoucherCode(null)
  }, [reservationId])

  const authUser = useAuthStore((state) => state.user)
  const paymentMutation = useMutation({
    mutationFn: async ({
      paymentRequest,
      voucherCode,
      orderId
    }: {
      paymentRequest: CreatePaymentRequest
      voucherCode?: string
      orderId?: number
    }) => {
      if (voucherCode && orderId && voucherCode !== appliedVoucherCode) {
        await orderApi.applyVoucherToOrder(orderId, { code: voucherCode })
        setAppliedVoucherCode(voucherCode)
      }

      const paymentResponse = await paymentApi.createPayment(paymentRequest)

      return {
        paymentResponse
      }
    },
    onSuccess: ({ paymentResponse }) => {
      const checkoutUrl = paymentResponse.data.data
      const currentReservationCode = reservationCode

      if (!currentReservationCode) {
        throw new Error('Không tìm thấy mã đặt bàn để thanh toán. Vui lòng thử lại.')
      }

      const itemsTotal = orderDetails?.itemsTotal ?? cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
      const tableDeposit = orderDetails?.tableDeposit ?? RESTAURANT_CONFIG.depositAmount
      const depositAmount = orderDetails?.depositAmount ?? itemsTotal * 0.2 + tableDeposit

      if (!checkoutUrl) {
        throw new Error('Không nhận được liên kết thanh toán')
      }

      setPaymentResultToSession({
        reservationCode: currentReservationCode,
        amount: depositAmount,
        paidAt: new Date().toISOString()
      })

      window.location.href = checkoutUrl
    },
  })
  const isProcessing = paymentMutation.isPending

  // Generated Data
  const timeSlots = useMemo(() => generateTimeSlots(RESTAURANT_CONFIG.openHour, RESTAURANT_CONFIG.closeHour), [])

  // --- HANDLERS ---
  const toggleTable = async (table: Table) => {
    // Nếu đã thanh toán, không cho phép thay đổi bàn
    if (isPaid) {
      return
    }
    const isSameTable = selectedTable?.id === table.id
    if (isSameTable) {
      // Nếu bàn đã được chọn, bỏ chọn nó
      setSelectedTable(null)
      // Cancel reservation cũ nếu đã có (vì đã bỏ chọn bàn)
      if (reservationId) {
        try {
          await reservationApi.cancelReservation(reservationId)
          setReservationId(null)
          setReservationCode(null)
          setExpiratedAt(null)
        } catch (error) {
          console.error('Failed to cancel reservation:', error)
          // Vẫn xóa reservationId để tránh lỗi UI, nhưng log lỗi
          setReservationId(null)
          setReservationCode(null)
          setExpiratedAt(null)
        }
      }
    } else {
      // Nếu chọn bàn mới, chỉ giữ lại bàn đó (thay thế bàn cũ nếu có)
      const previousTableId = selectedTable?.id
      const previousReservationId = reservationId

      // Nếu đã có reservation và chọn bàn khác → update tableId thay vì tạo mới
      if (previousReservationId && previousTableId && previousTableId !== table.id) {
        try {
          setIsCreatingReservation(true)
          // Update reservation table thay vì tạo mới
          await reservationApi.updateReservationTable(previousReservationId, {
            tableId: parseInt(table.id)
          })

          // Cập nhật state với bàn mới
          setSelectedTable(table)
        } catch (error) {
          console.error('Failed to update reservation table:', error)
          alert('Không thể thay đổi bàn. Vui lòng thử lại.')
          // Không thay đổi selectedTable để giữ nguyên bàn cũ
        } finally {
          setIsCreatingReservation(false)
        }
      } else {
        // Nếu chưa có reservation (lần đầu chọn bàn), tạo reservation mới
        setSelectedTable(table)

        if (!reservationId) {
          try {
            setIsCreatingReservation(true)
            const response = await reservationApi.createReservation({
              date,
              startTime,
              endTime,
              guestNumber: guests,
              tableId: parseInt(table.id),
              note: '' // Temporary reservation để lock bàn
            })

            if (response.data.data) {
              setReservationId(response.data.data.reservationId)
              setReservationCode(response.data.data.code)
              setExpiratedAt(response.data.data.expiratedAt)
            }
          } catch (error) {
            console.error('Failed to create temporary reservation:', error)
            alert('Không thể giữ chỗ bàn. Vui lòng thử lại.')
            // Nếu không tạo được reservation, bỏ chọn bàn
            setSelectedTable(null)
          } finally {
            setIsCreatingReservation(false)
          }
        }
      }
    }
  }

  const handleAddToCart = async (entry: Omit<PreOrderCartItem, 'quantity'>) => {
    if (!reservationId) {
      console.error('No reservationId available')
      return
    }

    const exist = cartItems.find((i) => i.type === entry.type && i.id === entry.id)
    const newQuantity = exist ? exist.quantity + 1 : 1

    try {
      // Nếu đã có trong cart, update quantity; nếu chưa có, add mới
      if (exist) {
        await reservationApi.updateItemInReservation(reservationId, {
          itemId: entry.type === 'item' ? entry.id : undefined,
          comboId: entry.type === 'combo' ? entry.id : undefined,
          quantity: newQuantity
        })
      } else {
        await reservationApi.addItemToReservation(reservationId, {
          itemId: entry.type === 'item' ? entry.id : undefined,
          comboId: entry.type === 'combo' ? entry.id : undefined,
          quantity: 1
        })
      }

      // Update local state
      if (exist) {
        setCartItems(
          cartItems.map((i) => (i.type === entry.type && i.id === entry.id ? { ...i, quantity: newQuantity } : i))
        )
      } else {
        setCartItems([...cartItems, { ...entry, quantity: 1 }])
      }
    } catch (error) {
      console.error('Failed to add/update item:', error)
      alert('Không thể thêm món. Vui lòng thử lại.')
    }
  }

  const handleNext = async () => {
    const closingTimeStr = `${RESTAURANT_CONFIG.closeHour}:00`

    // Step 1: Validation và chuyển sang Step 2
    if (currentStep === 1) {
      // Kiểm tra đã chọn startTime
      if (!startTime) {
        alert('Vui lòng chọn giờ bắt đầu!')
        return
      }

      // Kiểm tra đã chọn endTime
      if (!endTime) {
        alert('Vui lòng chọn thời gian kết thúc!')
        return
      }

      // Kiểm tra startTime < endTime
      if (startTime >= endTime) {
        alert('Thời gian kết thúc phải sau thời gian bắt đầu!')
        return
      }

      // Kiểm tra thời gian không trong quá khứ
      if (isDateTimeInPast(date, startTime)) {
        alert('Thời gian bắt đầu không được trong quá khứ!')
        return
      }

      if (isDateTimeInPast(date, endTime)) {
        alert('Thời gian kết thúc không được trong quá khứ!')
        return
      }

      // Kiểm tra endTime không vượt quá giờ đóng cửa
      if (endTime > closingTimeStr) {
        alert(`Thời gian kết thúc không được vượt quá giờ đóng cửa (${closingTimeStr})!`)
        return
      }

      setCurrentStep(2)
      return
    }

    // Step 2: Validation, tạo reservation và chuyển sang Step 3
    if (currentStep === 2) {
      if (!selectedTable) {
        alert('Vui lòng chọn 1 bàn!')
        return
      }
      if (selectedTable.capacity < guests) {
        if (
          !window.confirm(
            `Sức chứa bàn đã chọn (${selectedTable.capacity}) nhỏ hơn số khách (${guests}). Bạn có chắc không?`
          )
        )
          return
      }

      // Nếu đã có reservationId, reservation đã được tạo khi chọn bàn
      // Chỉ cần chuyển sang Step 3 (reservation đã có thời gian giữ 10 phút từ khi tạo)
      if (reservationId) {
        setCurrentStep(3)
        return
      }

      // Trường hợp này không nên xảy ra vì reservation đã được tạo khi chọn bàn
      // Nhưng để an toàn, vẫn tạo reservation nếu chưa có
      try {
        setIsCreatingReservation(true)
        const firstTable = selectedTable
        const response = await reservationApi.createReservation({
          date,
          startTime,
          endTime,
          guestNumber: guests,
          tableId: parseInt(firstTable.id),
          note: ''
        })

        if (response.data.data) {
          setReservationId(response.data.data.reservationId)
          setReservationCode(response.data.data.code)
          setExpiratedAt(response.data.data.expiratedAt)
          setCurrentStep(3)
        }
      } catch (error) {
        console.error('Failed to create reservation:', error)
        alert('Không thể tạo đặt bàn. Vui lòng thử lại.')
      } finally {
        setIsCreatingReservation(false)
      }
      return
    }

    // Step 3: Fetch order details và chuyển sang Step 4
    // Cho phép tiếp tục dù không có món (order có thể chưa có hoặc trống)
    if (currentStep === 3) {
      if (reservationId) {
        setIsLoadingOrderDetails(true)
        try {
          const response = await reservationApi.getReservationOrderDetails(reservationId)
          setOrderDetails(response.data.data)
          setCurrentStep(4)
        } catch (error) {
          console.error('Failed to fetch order details:', error)
          // Vẫn cho phép tiếp tục với orderDetails = null (Step4Payment có fallback logic)
          // Không hiện alert để không làm gián đoạn flow khi khách không chọn món
          setOrderDetails(null)
          setCurrentStep(4)
        } finally {
          setIsLoadingOrderDetails(false)
        }
      } else {
        setCurrentStep(4)
      }
    }
  }

  const handleRemoveFromCart = async (type: 'item' | 'combo', id: number) => {
    if (!reservationId) {
      console.error('No reservationId available')
      return
    }

    try {
      await reservationApi.removeItemFromReservation(reservationId, {
        itemId: type === 'item' ? id : undefined,
        comboId: type === 'combo' ? id : undefined
      })

      // Update local state
      setCartItems(cartItems.filter((i) => !(i.type === type && i.id === id)))
    } catch (error) {
      console.error('Failed to remove item:', error)
      alert('Không thể xóa món. Vui lòng thử lại.')
    }
  }

  const handlePayment = () => {
    if (!window.confirm('Xác nhận thanh toán tiền cọc?')) return

    if (!reservationCode) {
      alert('Không tìm thấy mã đặt bàn để thanh toán. Vui lòng thử lại.')
      return
    }

    paymentMutation.mutate({
      paymentRequest: {
        reservationCode,
        method: 'PAYOS'
      },
      voucherCode: voucherPreview?.code,
      orderId: orderDetails?.orderId
    })
  }

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đặt bàn? Bàn sẽ được giải phóng ngay lập tức.')) {
      return
    }

    // Cancel reservation nếu có
    if (reservationId) {
      try {
        await reservationApi.cancelReservation(reservationId)
        console.log('Reservation cancelled successfully')
      } catch (error) {
        console.error('Failed to cancel reservation:', error)
        // Vẫn reload trang dù có lỗi
      }
    }

    // Reload trang để reset toàn bộ state
    window.location.reload()
  }

  return (
    <div className='bg-background text-foreground min-h-screen px-4 py-10 font-sans md:px-8'>
      <div className='mx-auto max-w-5xl'>
        {/* Header Title */}
        <div className='mb-8 text-center md:text-left'>
          <h1 className='mb-2 text-3xl font-bold'>Đặt Bàn Trực Tuyến</h1>
          <p className='text-muted-foreground'>Hoàn tất 4 bước đơn giản để giữ chỗ tại nhà hàng của chúng tôi.</p>
        </div>

        {/* Progress Steps */}
        <Progress currentStep={currentStep} steps={['Thời gian', 'Chọn bàn', 'Món ăn', 'Thanh toán']} />

        {/* Main Content Area */}
        <div className='bg-card min-h-100'>
          {currentStep === 1 && (
            <Step1DateTime
              guests={guests}
              setGuests={setGuests}
              date={date}
              setDate={setDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              duration={duration}
              timeSlots={timeSlots}
            />
          )}
          {currentStep === 2 && (
            <Step2TableMap
              selectedTable={selectedTable}
              toggleTable={toggleTable}
              guests={guests}
              date={date}
              startTime={startTime}
              endTime={endTime}
              isPaid={isPaid}
            />
          )}
          {currentStep === 3 && reservationId && (
            <Step3FoodMenu
              cartItems={cartItems}
              onAdd={handleAddToCart}
              onRemove={handleRemoveFromCart}
              expiratedAt={expiratedAt}
            />
          )}
          {currentStep === 4 && (
            <Step4Payment
              user={authUser}
              bookingData={{ date, startTime, endTime, duration, guests, selectedTable }}
              cartItems={cartItems}
              onPay={handlePayment}
              onCancel={handleCancel}
              isProcessing={isProcessing}
              orderDetails={orderDetails}
              isLoadingOrderDetails={isLoadingOrderDetails}
              expiratedAt={expiratedAt}
              voucherPreview={voucherPreview}
              onVoucherPreviewChange={setVoucherPreview}
            />
          )}
        </div>

        {/* Footer Navigation */}
        {currentStep < 4 && (
          <div className='mt-8 flex justify-between border-t pt-6'>
            <button
              onClick={() => setCurrentStep((c) => c - 1)}
              disabled={currentStep === 1}
              className='flex items-center gap-2 font-bold text-gray-500 transition-all hover:text-black disabled:opacity-0'
            >
              <ArrowLeft size={18} /> Quay lại
            </button>

            <button
              onClick={handleNext}
              disabled={isCreatingReservation}
              className='bg-foreground text-primary flex items-center gap-2 rounded-lg px-8 py-3 font-bold transition-all hover:shadow-lg disabled:cursor-wait disabled:opacity-50'
            >
              {isCreatingReservation ? (
                <>Đang tạo đặt bàn...</>
              ) : (
                <>
                  {currentStep === 3 ? 'Xem lại & Thanh toán' : 'Tiếp tục'} <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer Navigation for Step 4 */}
        {currentStep === 4 && (
          <div className='mt-8 flex justify-between border-t pt-6'>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={isProcessing}
              className='flex items-center gap-2 font-bold text-gray-500 transition-all hover:text-black disabled:opacity-50'
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
            <div className='flex-1'></div> {/* Spacer */}
          </div>
        )}
      </div>
    </div>
  )
}

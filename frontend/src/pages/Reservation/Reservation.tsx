import { useState, useMemo, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { addMinutesToTime, generateTimeSlots, isDateTimeInPast } from '@/utils/utils'
import { RESTAURANT_CONFIG } from '@/pages/Reservation/data'
import Step1DateTime from '@/pages/Reservation/components/step/Step1DateTime/Step1DateTime'
import Step2TableMap from '@/pages/Reservation/components/step/Step2TableMap/Step2TableMap'
import Step3FoodMenu from '@/pages/Reservation/components/step/Step3FoodMenu'
import Step4Payment from '@/pages/Reservation/components/step/Step4Payment/Step4Payment'
import orderApi from '@/apis/order.api'
import reservationApi from '@/apis/reservation.api'
import paymentApi from '@/apis/payment.api'
import layoutApi from '@/apis/layout.api'
import type { CreatePaymentRequest } from '@/apis/payment.api'
import type { PreOrderCartItem, ReservationTable as Table } from '@/types/reservation.type'
import type { OrderDetailResponse } from '@/types/reservation.type'
import type { VoucherValidateResponse } from '@/types/voucher.type'
import { useAuthStore } from '@/stores/useAuthStore'
import Progress from '@/pages/Reservation/components/Progress'
import { setPaymentResultToSession } from '@/utils/paymentResultStorage'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'

// --- 3. MAIN COMPONENT ---
export default function Reservation() {
  const [searchParams] = useSearchParams()

  const [currentStep, setCurrentStep] = useState(1)

  // Data State
  const [guests, setGuests] = useState(() => {
    const g = searchParams.get('guests')
    return g ? parseInt(g) : 2
  })
  const [date, setDate] = useState(() => {
    const d = searchParams.get('date')
    return d || new Date().toISOString().split('T')[0]
  })

  const [startTime, setStartTime] = useState(() => {
    const st = searchParams.get('startTime')
    return st || '18:00'
  })
  const duration = 240
  const plannedEndTime = useMemo(() => addMinutesToTime(startTime, duration), [startTime])

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

  const isAutoBookingRef = useRef(false)

  // --- AUTO BOOKING TỪ AI CHAT ---
  useEffect(() => {
    const handleAutoBooking = async () => {
      // Prevent Strict Mode from running this twice
      if (isAutoBookingRef.current) return

      const stepParam = searchParams.get('step')
      const tableNameParam = searchParams.get('tableName')
      
      if (tableNameParam && stepParam && !reservationId) {
        isAutoBookingRef.current = true 
        try {
          // Lấy danh sách bàn khả dụng
          const tablesRes = await layoutApi.getAvailableTables({
            date,
            startTime,
            guestNumber: guests
          })
          
          if (tablesRes.data.data) {
            const tables = tablesRes.data.data
            // Tìm bàn khớp tên (vd: "Bàn 01" khớp "01" hoặc "Bàn 01")
            const matchedTable = tables.find(t => 
              t.name.toLowerCase() === tableNameParam.toLowerCase() || 
              `Bàn ${t.name}`.toLowerCase() === tableNameParam.toLowerCase() ||
              t.name.toLowerCase() === tableNameParam.replace(/bàn\s+/i, '').toLowerCase()
            )
            
            if (matchedTable) {
              const tableObj: Table = {
                id: matchedTable.id.toString(),
                name: matchedTable.name,
                capacity: matchedTable.capacity || 2,
                status: 'AVAILABLE',
                type: 'STANDARD',
                areaName: matchedTable.areaName,
                floorName: matchedTable.floorName
              }
              setSelectedTable(tableObj)
              
              // Tạo pre-reservation
              setIsCreatingReservation(true)
              const createRes = await reservationApi.createReservation({
                date,
                startTime,
                guestNumber: guests,
                tableId: matchedTable.id,
                note: 'Tự động đặt qua trợ lý CrownDine AI'
              })
              
              if (createRes.data.data) {
                setReservationId(createRes.data.data.reservationId)
                setReservationCode(createRes.data.data.code)
                setExpiratedAt(createRes.data.data.expiratedAt)
                setCurrentStep(parseInt(stepParam)) // Chuyển thẳng tới bước 3 hoặc 4
              }
            } else {
              console.warn("AI AutoBook - Không tìm thấy bàn khả dụng:", tableNameParam)
              alert(`Rất tiếc, bàn do AI chọn (${tableNameParam}) hiện đã được đặt hoặc không khả dụng. Vui lòng tự chọn bàn khác nhé!`)
              setCurrentStep(2) // Đưa người dùng về màn hình tự chọn bàn
            }
          }
        } catch (error) {
          console.error("Lỗi khi tự động đặt bàn qua AI:", error)
          setCurrentStep(2) // Lỗi thì đưa về chọn bàn thủ công
        } finally {
          setIsCreatingReservation(false)
        }
      }
    }
    handleAutoBooking()
  }, []) // Chỉ chạy 1 lần khi mount màn hình Reservation

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
        await orderApi.applyVoucher(orderId, voucherCode)
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
        amount: depositAmount || 0,
        paidAt: new Date().toISOString()
      })

      window.location.href = checkoutUrl
    }
  })
  const isProcessing = paymentMutation.isPending

  // Generated Data
  const timeSlots = useMemo(() => generateTimeSlots(9, 22, 30).filter((slot) => slot !== '22:00'), [])

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
              guestNumber: guests,
              tableId: parseInt(table.id),
              note: '' // Temporary reservation để lock bàn
            })

            if (response.data.data) {
              setReservationId(response.data.data.reservationId)
              setReservationCode(response.data.data.reservationCode)
              setExpiratedAt(null)
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
          quantity: newQuantity,
          note: exist.note
        })
      } else {
        await reservationApi.addItemToReservation(reservationId, {
          itemId: entry.type === 'item' ? entry.id : undefined,
          comboId: entry.type === 'combo' ? entry.id : undefined,
          quantity: 1,
          note: undefined
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

  const handleUpdateQuantity = async (type: 'item' | 'combo', id: number, delta: number) => {
    if (!reservationId) return

    const exist = cartItems.find((i) => i.type === type && i.id === id)
    if (!exist) return

    const newQuantity = exist.quantity + delta
    if (newQuantity < 1) return

    try {
      await reservationApi.updateItemInReservation(reservationId, {
        itemId: type === 'item' ? id : undefined,
        comboId: type === 'combo' ? id : undefined,
        quantity: newQuantity,
        note: exist.note // Preserve current note
      })

      setCartItems(cartItems.map((i) => (i.type === type && i.id === id ? { ...i, quantity: newQuantity } : i)))
    } catch (error) {
      console.error('Failed to update quantity:', error)
      alert('Không thể cập nhật số lượng. Vui lòng thử lại.')
    }
  }

  const handleUpdateNote = (type: 'item' | 'combo', id: number, note: string) => {
    setCartItems(cartItems.map((i) => (i.type === type && i.id === id ? { ...i, note } : i)))
  }

  const handleNext = async () => {
    // Step 1: Validation và chuyển sang Step 2
    if (currentStep === 1) {
      if (!startTime) {
        alert('Vui lòng chọn giờ bắt đầu!')
        return
      }

      if (isDateTimeInPast(date, startTime)) {
        alert('Thời gian bắt đầu không được trong quá khứ!')
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
          guestNumber: guests,
          tableId: parseInt(firstTable.id),
          note: ''
        })

        if (response.data.data) {
          setReservationId(response.data.data.reservationId)
          setReservationCode(response.data.data.reservationCode)
          setExpiratedAt(null)
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
    // Step 3: Fetch order details và chuyển sang Step 4
    // Cho phép tiếp tục dù không có món (order có thể chưa có hoặc trống)
    if (currentStep === 3) {
      if (reservationId) {
        setIsLoadingOrderDetails(true)
        try {
          // --- BEGIN SYNC ---
          // Đồng bộ tất cả (đặc biệt là ghi chú) lên server trước khi sang step 4
          await Promise.all(
            cartItems.map((item) =>
              reservationApi.updateItemInReservation(reservationId, {
                itemId: item.type === 'item' ? item.id : undefined,
                comboId: item.type === 'combo' ? item.id : undefined,
                quantity: item.quantity,
                note: item.note
              })
            )
          )
          // --- END SYNC ---

          const response = await reservationApi.getReservationOrderDetails(reservationId)
          setOrderDetails(response.data.data)
          setCurrentStep(4)
        } catch (error) {
          console.error('Failed to fetch/sync order details:', error)
          // Vẫn cho phép tiếp tục với orderDetails = null (Step4Payment có fallback logic)
          // Nhưng hiện thông báo lỗi nếu sync thất bại
          toast.error('Có lỗi xảy ra khi lưu thông tin món ăn. Vui lòng thử lại.')
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
      orderId: orderDetails?.orderId ?? undefined
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
              plannedEndTime={plannedEndTime}
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
              isPaid={isPaid}
            />
          )}
          {currentStep === 3 && reservationId && (
            <Step3FoodMenu
              cartItems={cartItems}
              onAdd={handleAddToCart}
              onRemove={handleRemoveFromCart}
              updateQuantity={handleUpdateQuantity}
              onUpdateNote={handleUpdateNote}
              expiratedAt={expiratedAt}
            />
          )}
          {currentStep === 4 && (
            <Step4Payment
              user={authUser}
              bookingData={{ date, startTime, plannedEndTime, guests, selectedTable }}
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

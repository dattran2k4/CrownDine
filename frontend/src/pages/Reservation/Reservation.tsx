import { useState, useMemo } from 'react'
import { ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { addMinutesToTime, generateTimeSlots } from '@/utils/utils'
import { RESTAURANT_CONFIG, USER_INFO, type MenuItem, type Table } from '@/pages/Reservation/data'
import Step1DateTime from '@/pages/Reservation/components/step/Step1DateTime/Step1DateTime'
import Step2TableMap from '@/pages/Reservation/components/step/Step2TableMap/Step2TableMap'
import Step3FoodMenu from '@/pages/Reservation/components/step/Step3FoodMenu'
import Step4Payment from '@/pages/Reservation/components/step/Step4Payment/Step4Payment'

// --- 3. MAIN COMPONENT ---
export default function Reservation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false) // Loading state for payment

  // Data State
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const [startTime, setStartTime] = useState('18:00')
  const [duration, setDuration] = useState(120) // 2 tiếng

  const endTime = useMemo(() => addMinutesToTime(startTime, duration), [startTime, duration])

  const [selectedTables, setSelectedTables] = useState<Table[]>([])
  const [multiTableOption, setMultiTableOption] = useState<'NEAR' | 'SEPARATED'>('NEAR')

  const [cartItems, setCartItems] = useState<(MenuItem & { quantity: number })[]>([])

  // Generated Data
  const timeSlots = useMemo(() => generateTimeSlots(RESTAURANT_CONFIG.openHour, RESTAURANT_CONFIG.closeHour), [])
  const totalCapacity = selectedTables.reduce((acc, t) => acc + t.capacity, 0)
  // --- HANDLERS ---
  const toggleTable = (table: Table) => {
    if (table.status !== 'AVAILABLE') return
    const exists = selectedTables.find((t) => t.id === table.id)
    if (exists) {
      setSelectedTables(selectedTables.filter((t) => t.id !== table.id))
    } else {
      setSelectedTables([...selectedTables, table])
    }
  }

  const handleAddToCart = (item: MenuItem) => {
    const exist = cartItems.find((i) => i.id === item.id)
    if (exist) {
      setCartItems(cartItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
  }

  const handleNext = () => {
    const closingTimeStr = `${RESTAURANT_CONFIG.closeHour}:00`

    // So sánh string đơn giản (HH:mm). Lưu ý: Nếu nhà hàng mở qua đêm (VD: 02:00 sáng hôm sau) thì logic so sánh string này cần đổi.
    // Giả định nhà hàng đóng trước 24h:
    if (endTime > closingTimeStr && startTime < closingTimeStr) {
      alert(`Nhà hàng đóng cửa lúc ${closingTimeStr}. Vui lòng giảm thời gian ngồi hoặc đến sớm hơn.`)
      return
    }
    // Validation
    if (currentStep === 2) {
      if (selectedTables.length === 0) return alert('Vui lòng chọn ít nhất 1 bàn!')
      if (totalCapacity < guests) {
        if (!window.confirm(`Sức chứa bàn đã chọn (${totalCapacity}) nhỏ hơn số khách (${guests}). Bạn có chắc không?`))
          return
      }
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handleRemoveFromCart = (itemId: number) => {
    setCartItems(cartItems.filter((i) => i.id !== itemId))
  }

  const handlePayment = () => {
    if (!window.confirm('Xác nhận thanh toán tiền cọc?')) return
    setIsProcessing(true)
    // Giả lập call API Payment
    setTimeout(() => {
      setIsProcessing(false)
      alert('Thanh toán thành công! Mã đặt bàn của bạn là #BK-2024888')
      window.location.href = '/' // Quay về trang chủ
    }, 2000)
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
        <div className='mb-10'>
          <div className='relative flex items-center justify-between'>
            {/* Line background */}
            <div className='absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 transform bg-gray-200'></div>
            <div
              className={`bg-primary absolute top-1/2 left-0 -z-10 h-1 -translate-y-1/2 transform transition-all duration-300`}
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>

            {['Thời gian', 'Chọn bàn', 'Món ăn', 'Thanh toán'].map((step, idx) => {
              const stepNum = idx + 1
              const isActive = currentStep >= stepNum
              const isCurrent = currentStep === stepNum

              return (
                <div key={step} className='bg-background flex flex-col items-center px-2'>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${isActive ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white text-gray-400'}`}
                  >
                    {isActive && !isCurrent ? <CheckCircle size={20} /> : stepNum}
                  </div>
                  <span className={`mt-2 text-xs font-bold ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

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
              duration={duration}
              setDuration={setDuration}
              timeSlots={timeSlots}
            />
          )}
          {currentStep === 2 && (
            <Step2TableMap
              selectedTables={selectedTables}
              toggleTable={toggleTable}
              guests={guests}
              totalCapacity={totalCapacity}
              multiTableOption={multiTableOption}
              setMultiTableOption={setMultiTableOption}
            />
          )}
          {currentStep === 3 && (
            <Step3FoodMenu cartItems={cartItems} onAdd={handleAddToCart} onRemove={handleRemoveFromCart} />
          )}
          {currentStep === 4 && (
            <Step4Payment
              userInfo={USER_INFO}
              bookingData={{ date, startTime, duration, guests, selectedTables }}
              cartItems={cartItems}
              onPay={handlePayment}
              onCancel={() => window.location.reload()}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Footer Navigation (Step 1-3 only) */}
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
              className='bg-foreground text-primary flex items-center gap-2 rounded-lg px-8 py-3 font-bold transition-all hover:shadow-lg'
            >
              {currentStep === 3 ? 'Xem lại & Thanh toán' : 'Tiếp tục'} <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

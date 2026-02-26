import { DURATION_OPTIONS, RESTAURANT_CONFIG } from '@/pages/Reservation/data'
import { addMinutesToTime } from '@/utils/utils'
import { AlertCircle, Calendar, Clock, Hourglass, Users } from 'lucide-react'

interface Props {
  guests: number
  setGuests: (n: number) => void
  date: string
  setDate: (s: string) => void
  startTime: string
  setStartTime: (s: string) => void
  duration: number
  setDuration: (n: number) => void
  timeSlots: string[]
}
const Step1DateTime = ({
  guests,
  setGuests,
  date,
  setDate,
  startTime,
  setStartTime,
  duration,
  setDuration,
  timeSlots
}: Props) => {
  // Tính giờ kết thúc dự kiến để hiển thị
  const endTime = addMinutesToTime(startTime, duration)

  // Validate: Kiểm tra nếu giờ kết thúc vượt quá giờ đóng cửa
  const closingTimeStr = `${RESTAURANT_CONFIG.closeHour}:00`
  const isOverTime = endTime > closingTimeStr && parseInt(endTime.split(':')[0]) < RESTAURANT_CONFIG.openHour
  // Note: Logic so sánh chuỗi thời gian đơn giản, thực tế nên dùng Date object nếu qua ngày mới

  return (
    <div className='animate-fade-in space-y-8 m-4 p-4'>
      {/* 1. Chọn Ngày & Số khách */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-2'>
          <label className='flex items-center gap-2 text-sm font-bold'>
            <Users size={16} /> Số lượng khách
          </label>
          <div className='flex w-fit items-center gap-4 rounded-lg border bg-white p-1'>
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className='h-10 w-10 rounded text-lg font-bold hover:bg-gray-100'
            >
              -
            </button>
            <span className='w-12 text-center text-xl font-bold'>{guests}</span>
            <button
              onClick={() => setGuests(guests + 1)}
              className='h-10 w-10 rounded text-lg font-bold hover:bg-gray-100'
            >
              +
            </button>
          </div>
        </div>
        <div className='space-y-2'>
          <label className='flex items-center gap-2 text-sm font-bold'>
            <Calendar size={16} /> Chọn ngày
          </label>
          <input
            type='date'
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className='bg-card border-border focus:ring-primary/20 w-full rounded-lg border p-3 outline-none focus:ring-2'
          />
        </div>
      </div>

      <div className='my-4 border-t border-dashed'></div>

      {/* 2. Chọn Giờ Bắt Đầu (Start Time) */}
      <div className='space-y-3'>
        <label className='flex items-center gap-2 text-sm font-bold'>
          <Clock size={16} /> Giờ bắt đầu (Start Time)
        </label>
        <div className='custom-scrollbar grid max-h-40 grid-cols-4 gap-3 overflow-y-auto pr-2 md:grid-cols-6 lg:grid-cols-8'>
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => setStartTime(slot)}
              className={`rounded border px-1 py-2 text-sm transition-all ${startTime === slot ? 'bg-primary border-primary ring-primary/30 text-white shadow-md ring-2' : 'hover:border-primary border-gray-200 bg-white text-gray-700'}`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Chọn Thời Lượng (Duration) */}
      <div className='space-y-3'>
        <label className='flex items-center gap-2 text-sm font-bold'>
          <Hourglass size={16} /> Thời gian sử dụng (Duration)
        </label>
        <div className='flex flex-wrap gap-3'>
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${duration === opt.value ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tổng kết thời gian (Preview) */}
      <div
        className={`flex items-start gap-3 rounded-lg p-4 ${isOverTime ? 'border border-red-200 bg-red-50' : 'border border-blue-200 bg-blue-50'}`}
      >
        {isOverTime ? <AlertCircle className='shrink-0 text-red-500' /> : <Clock className='shrink-0 text-blue-500' />}
        <div>
          <p className={`text-sm font-bold ${isOverTime ? 'text-red-700' : 'text-blue-700'}`}>
            Thời gian đặt: {startTime} - {endTime} ({duration / 60} tiếng)
          </p>
          {isOverTime ? (
            <p className='mt-1 text-xs text-red-600'>
              Lưu ý: Thời gian kết thúc vượt quá giờ đóng cửa ({RESTAURANT_CONFIG.closeHour}:00). Vui lòng chọn giờ đến
              sớm hơn hoặc giảm thời lượng.
            </p>
          ) : (
            <p className='mt-1 text-xs text-blue-600'>Bàn của bạn sẽ được giữ trong khoảng thời gian này.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step1DateTime

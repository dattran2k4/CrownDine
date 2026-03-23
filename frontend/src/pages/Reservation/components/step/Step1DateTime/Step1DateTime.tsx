import { RESTAURANT_CONFIG } from '@/pages/Reservation/data'
import { isDateTimeInPast } from '@/utils/utils'
import { Calendar, Clock, Users } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  guests: number
  setGuests: (n: number) => void
  date: string
  setDate: (s: string) => void
  startTime: string
  setStartTime: (s: string) => void
  timeSlots: string[]
}
const Step1DateTime = ({
  guests,
  setGuests,
  date,
  setDate,
  startTime,
  setStartTime,
  timeSlots
}: Props) => {
  // Reset startTime nếu nó trong quá khứ khi date thay đổi
  useEffect(() => {
    if (isDateTimeInPast(date, startTime)) {
      // Tìm giờ hợp lệ đầu tiên trong tương lai từ timeSlots
      const nextValidTime = timeSlots.find((slot) => !isDateTimeInPast(date, slot))

      if (nextValidTime) {
        setStartTime(nextValidTime)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, timeSlots])

  return (
    <div className='animate-fade-in m-4 space-y-8 p-4'>
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

      {/* 2. Chọn Giờ Đến */}
      <div className='space-y-3'>
        <label className='flex items-center gap-2 text-sm font-bold'>
          <Clock size={16} /> Giờ đến
        </label>
        <div className='custom-scrollbar grid max-h-40 grid-cols-4 gap-3 overflow-y-auto pr-2 md:grid-cols-6 lg:grid-cols-8'>
          {timeSlots.map((slot) => {
            const isPast = isDateTimeInPast(date, slot)
            return (
              <button
                key={slot}
                onClick={() => !isPast && setStartTime(slot)}
                disabled={isPast}
                className={`rounded border px-1 py-2 text-sm transition-all ${
                  isPast
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-50'
                    : startTime === slot
                      ? 'bg-primary border-primary ring-primary/30 text-white shadow-md ring-2'
                      : 'hover:border-primary border-gray-200 bg-white text-gray-700'
                }`}
              >
                {slot}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Tổng kết thời gian (Preview) */}
      <div className='flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4'>
        <Clock className='shrink-0 text-blue-500' />
        <div>
          <p className='text-sm font-bold text-blue-700'>
            Giờ đến: {startTime}
          </p>
          <p className='mt-1 text-xs text-blue-600'>Bàn của bạn sẽ được giữ từ giờ đến này.</p>
        </div>
      </div>
    </div>
  )
}

export default Step1DateTime

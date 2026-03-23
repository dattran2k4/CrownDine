import { RESTAURANT_CONFIG } from '@/pages/Reservation/data'
import { addMinutesToTime, isDateTimeInPast } from '@/utils/utils'
import { AlertCircle, Calendar, Clock, Hourglass, Users } from 'lucide-react'
import { useEffect, useMemo } from 'react'

interface Props {
  guests: number
  setGuests: (n: number) => void
  date: string
  setDate: (s: string) => void
  startTime: string
  setStartTime: (s: string) => void
  endTime: string
  setEndTime: (s: string) => void
  duration: number
  timeSlots: string[]
}
const Step1DateTime = ({
  guests,
  setGuests,
  date,
  setDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  duration,
  timeSlots
}: Props) => {
  // Reset startTime và endTime nếu chúng trong quá khứ khi date thay đổi
  useEffect(() => {
    if (isDateTimeInPast(date, startTime)) {
      // Tìm giờ hợp lệ đầu tiên trong tương lai từ timeSlots
      const nextValidTime = timeSlots.find((slot) => !isDateTimeInPast(date, slot))

      if (nextValidTime) {
        setStartTime(nextValidTime)
        const defaultEndTime = addMinutesToTime(nextValidTime, 120) // 2 giờ mặc định
        const closingTimeStr = `${RESTAURANT_CONFIG.closeHour}:00`
        const validEndTime = defaultEndTime > closingTimeStr ? closingTimeStr : defaultEndTime
        if (!isDateTimeInPast(date, validEndTime)) {
          setEndTime(validEndTime)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, timeSlots])

  // Tạo danh sách các giờ kết thúc có thể (30 phút một lần, từ startTime + 30 phút đến closeHour)
  const endTimeOptions = useMemo(() => {
    const options: string[] = []
    const closingTimeStr = `${RESTAURANT_CONFIG.closeHour}:00`
    let currentTime = addMinutesToTime(startTime, 30) // Bắt đầu từ 30 phút sau startTime

    while (currentTime <= closingTimeStr) {
      options.push(currentTime)
      currentTime = addMinutesToTime(currentTime, 30)

      // Giới hạn tối đa 6 giờ (12 options)
      if (options.length >= 12) break
    }

    return options
  }, [startTime])

  // Validate: Kiểm tra nếu giờ kết thúc vượt quá giờ đóng cửa
  const closingTimeStr = `${RESTAURANT_CONFIG.closeHour}:00`
  const isOverTime = endTime > closingTimeStr && parseInt(endTime.split(':')[0]) < RESTAURANT_CONFIG.openHour
  // Note: Logic so sánh chuỗi thời gian đơn giản, thực tế nên dùng Date object nếu qua ngày mới

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

      {/* 2. Chọn Giờ Bắt Đầu (Start Time) */}
      <div className='space-y-3'>
        <label className='flex items-center gap-2 text-sm font-bold'>
          <Clock size={16} /> Giờ bắt đầu (Start Time)
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

      {/* 3. Chọn Thời gian kết thúc */}
      <div className='space-y-3'>
        <label className='flex items-center gap-2 text-sm font-bold'>
          <Hourglass size={16} /> Thời gian kết thúc
        </label>
        <div className='custom-scrollbar grid max-h-40 grid-cols-4 gap-3 overflow-y-auto pr-2 md:grid-cols-6 lg:grid-cols-8'>
          {endTimeOptions.map((time) => {
            const isPast = isDateTimeInPast(date, time)
            return (
              <button
                key={time}
                onClick={() => !isPast && setEndTime(time)}
                disabled={isPast}
                className={`rounded border px-1 py-2 text-sm transition-all ${
                  isPast
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-50'
                    : endTime === time
                      ? 'border-orange-500 bg-orange-500 text-white shadow-md ring-2 ring-orange-500/30'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-orange-500'
                }`}
              >
                {time}
              </button>
            )
          })}
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

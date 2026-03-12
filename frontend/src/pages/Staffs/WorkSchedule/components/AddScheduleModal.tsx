import { Button } from '@/components/ui/button'
import useCreateSchedule from '@/hooks/useCreateSchedule'
import useShift from '@/hooks/useShift'
import type { CreateWorkScheduleRequest } from '@/types/workSchedule.type'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  staffId: number
}

export function AddScheduleModal({ isOpen, onClose, selectedDate, staffId }: Props) {
  const { data: shifts, isLoading } = useShift()
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)
  const [isRepeatChecked, setIsRepeatChecked] = useState(false)
  const [endDate, setEndDate] = useState<undefined | string>(undefined)
  const [applyToOtherStaff] = useState(false)
  const [otherStaffIds] = useState<number[]>([])
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  const createMutation = useCreateSchedule(onClose)

  const toggleDay = (dayVal: number) => {
    setSelectedDays((prev) => (prev.includes(dayVal) ? prev.filter((d) => d !== dayVal) : [...prev, dayVal]))
  }

  const handleSave = () => {
    if (!selectedShiftId) {
      toast.error('Vui lòng chọn ca làm việc!')
      return
    }

    const formatDateForBackend = (dateStr?: string) => {
      if (!dateStr) return undefined
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
      return dateStr
    }

    const payload: CreateWorkScheduleRequest = {
      shiftId: selectedShiftId,
      staffIds: [staffId],
      workDate: formatDateForBackend(selectedDate)!,
      repeatWeekly: isRepeatChecked,

      daysOfWeek: isRepeatChecked ? selectedDays : [],
      endDate: isRepeatChecked ? formatDateForBackend(endDate) : undefined,
      applyToOthersStaff: applyToOtherStaff,
      otherStaffIds: applyToOtherStaff ? otherStaffIds : []
    }
    createMutation.mutate(payload)
  }

  if (!isOpen) return null

  return (
    <div className='space-y-6 p-6'>
      {/* Phần chọn ca làm việc */}
      <div>
        <label className='mb-2 block font-bold'>Chọn ca làm việc</label>
        {isLoading ? (
          <div className='h-10 animate-pulse rounded-lg bg-gray-100'></div>
        ) : (
          <select
            className='w-full rounded-lg border p-2'
            value={selectedShiftId || ''}
            onChange={(e) => setSelectedShiftId(Number(e.target.value))}
          >
            <option value='' disabled>
              -- Chọn ca làm việc --
            </option>
            {shifts?.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name} ({shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Checkbox lặp lại */}
      <div>
        <label className='flex cursor-pointer items-center gap-2'>
          <input
            type='checkbox'
            checked={isRepeatChecked}
            onChange={(e) => setIsRepeatChecked(e.target.checked)}
            className='h-4 w-4 rounded border-gray-300'
          />
          <span className='font-medium'>Lặp lại hàng tuần</span>
        </label>
      </div>

      {isRepeatChecked && (
        <div className='animate-in fade-in space-y-4 duration-300'>
          <div className='flex flex-wrap gap-2'>
            {[
              { label: 'T2', val: 1 },
              { label: 'T3', val: 2 },
              { label: 'T4', val: 3 },
              { label: 'T5', val: 4 },
              { label: 'T6', val: 5 },
              { label: 'T7', val: 6 },
              { label: 'CN', val: 7 }
            ].map((day) => (
              <Button
                key={day.val}
                type='button'
                onClick={() => toggleDay(day.val)}
                className={`h-10 w-10 rounded-lg border font-medium transition-all ${selectedDays.includes(day.val)
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'bg-border-white text-black hover:border-orange-500'
                  }`}
              >
                {day.label}
              </Button>
            ))}
          </div>
          {/* Input chọn ngày kết thúc */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Kết thúc <span className="text-gray-500 font-normal">(Mặc định 2 tháng nếu để trống)</span>
            </label>
            <input type='date' className='w-full rounded-lg border p-2' onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      )}

      {/* Hành động */}
      <div className='flex justify-end gap-2 border-t pt-4'>
        <Button type='button' onClick={onClose} className='rounded-lg border px-4 py-2 hover:bg-gray-50'>
          Hủy
        </Button>
        <Button
          type='button'
          onClick={handleSave}
          disabled={createMutation.isPending}
          className='rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50'
        >
          {createMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
        </Button>
      </div>
    </div>
  )
}

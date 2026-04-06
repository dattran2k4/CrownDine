import { Plus } from 'lucide-react'
import { ShiftItem } from './ShiftItem'

interface Shift {
  id: string // Thêm ID để biết ca nào cần cập nhật
  name: string
  colorClass: string
  repeatGroupId?: string
  startTime: string
  endTime: string
}

interface ScheduleCellProps {
  isAdmin?: boolean
  shifts?: Shift[]
  dateStr: string // Nhận ngày từ Table
  onAdd?: () => void // Callback khi bấm thêm
  onDelete?: (shiftId: string, repeatGroupId?: string, workDate?: string) => void
}

export function ScheduleCell({ isAdmin = false, shifts = [], dateStr, onAdd, onDelete }: ScheduleCellProps) {
  return (
    <td className='border-border hover:bg-muted/50 relative h-full min-h-[80px] border-r bg-card p-2 align-top transition-colors'>
      <div className='relative z-10 flex h-full flex-col gap-1.5'>
        {shifts.map((shift) => (
          <ShiftItem
            key={shift.id}
            isAdmin={isAdmin}
            shiftName={shift.name}
            startTime={shift.startTime} // Ví dụ: "07:00:00"
            endTime={shift.endTime} // Ví dụ: "11:00:00"
            onDelete={() => {
              if (onDelete) onDelete(shift.id, shift.repeatGroupId, dateStr)
            }}
          />
        ))}

        {/* Nút "Thêm lịch" hiển thị phía dưới ca làm khi Admin hover */}
        {isAdmin && (
          <button
            onClick={onAdd}
            className='mt-auto flex cursor-pointer items-center gap-1 pt-2 text-[13px] font-medium text-orange-500 opacity-0 transition-opacity hover:opacity-100'
          >
            <Plus className='h-4 w-4' />
            Thêm lịch
          </button>
        )}
      </div>

      {/* Lớp phủ click cho Admin ở những vùng trống của ô (Optional) */}
      {isAdmin && shifts.length === 0 && (
        <div onClick={onAdd} className='absolute inset-0 z-0 hidden cursor-pointer bg-black/[0.02] group-hover:block' />
      )}
    </td>
  )
}

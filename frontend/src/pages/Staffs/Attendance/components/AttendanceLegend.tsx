import { ATTENDANCE_STATUS_COLORS, ATTENDANCE_STATUS_LABELS, type EAttendanceStatus } from '@/types/attendance.type'
import { cn } from '@/lib/utils'

const STATUS_ORDER: EAttendanceStatus[] = [
  'ON_TIME',
  'LATE_EARLY',
  'MISSING_PUNCH',
  'NOT_PUNCHED',
  'ABSENT_OFF'
]

export function AttendanceLegend() {
  return (
    <div className='mt-6 flex flex-wrap items-center gap-3'>
      {STATUS_ORDER.map((status) => (
        <div
          key={status}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm shadow-xs'
          )}
        >
          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', ATTENDANCE_STATUS_COLORS[status])} />
          <span className='text-muted-foreground'>{ATTENDANCE_STATUS_LABELS[status]}</span>
        </div>
      ))}
    </div>
  )
}

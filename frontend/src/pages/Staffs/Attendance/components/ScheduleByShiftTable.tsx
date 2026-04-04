import type {
  AttendanceScheduleResponse,
  AttendanceScheduleCellResponse,
  AttendanceScheduleEmployeeResponse
} from '@/types/attendance.type'
import { ATTENDANCE_STATUS_COLORS, type EAttendanceStatus } from '@/types/attendance.type'
import { cn } from '@/lib/utils'

function formatShiftTime(start: string, end: string) {
  const toLocal = (t: string) => t.slice(0, 5)
  return `${toLocal(start)} - ${toLocal(end)}`
}

function getStatusColor(status: string): string {
  return ATTENDANCE_STATUS_COLORS[status as EAttendanceStatus] ?? 'bg-gray-300'
}

interface ScheduleByShiftTableProps {
  data: AttendanceScheduleResponse
  onCellClick?: (userId: number, shiftId: number, workDate: string) => void
}

export function ScheduleByShiftTable({ data, onCellClick }: ScheduleByShiftTableProps) {
  const { shifts, cells, weekStart } = data
  const weekDays = 7
  const start = new Date(weekStart)
  const dayLabels: { dayOfWeek: string; dateShort: string; date: string }[] = []
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
  for (let i = 0; i < weekDays; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dayLabels.push({
      dayOfWeek: dayNames[i],
      dateShort: `${d.getDate()}/${d.getMonth() + 1}`,
      date: d.toISOString().slice(0, 10)
    })
  }

  const cellMap = new Map<string, AttendanceScheduleCellResponse>()
  cells.forEach((c) => {
    cellMap.set(`${c.shiftId}-${c.workDate}`, c)
  })

  return (
    <div className='overflow-x-auto rounded-xl border border-border bg-card shadow-sm'>
      <table className='w-full min-w-[700px] border-collapse text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/30'>
            <th className='border-r border-border px-4 py-3 text-left font-medium text-foreground'>
              Ca làm việc
            </th>
            {dayLabels.map((d) => (
              <th
                key={d.date}
                className='border-r border-border px-3 py-3 text-center font-medium last:border-r-0'
              >
                <div>{d.dayOfWeek}</div>
                <div className='text-muted-foreground text-xs'>{d.dateShort}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className='border-b border-border last:border-b-0'>
              <td className='border-r border-border bg-muted/20 px-4 py-3'>
                <div className='font-medium'>{shift.name}</div>
                <div className='text-muted-foreground text-xs'>
                  {formatShiftTime(shift.startTime, shift.endTime)}
                </div>
              </td>
              {dayLabels.map((d) => {
                const cell = cellMap.get(`${shift.id}-${d.date}`)
                const employees: AttendanceScheduleEmployeeResponse[] = cell?.employees ?? []
                return (
                  <td
                    key={d.date}
                    className='border-r border-border px-2 py-2 align-top last:border-r-0'
                  >
                    {employees.length === 0 ? (
                      <span className='text-muted-foreground'>-</span>
                    ) : (
                      <div className='space-y-1.5'>
                        {employees.map((emp) => (
                          <div
                            key={emp.userId}
                            className={cn(
                              'flex items-center gap-2 rounded-md px-2 py-1',
                              onCellClick && 'cursor-pointer hover:bg-muted/50'
                            )}
                            onClick={() =>
                              onCellClick?.(emp.userId, shift.id, d.date)
                            }
                          >
                            <span
                              className={cn(
                                'h-2.5 w-2.5 shrink-0 rounded-full',
                                getStatusColor(emp.status)
                              )}
                            />
                            <span className='truncate'>{emp.fullName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

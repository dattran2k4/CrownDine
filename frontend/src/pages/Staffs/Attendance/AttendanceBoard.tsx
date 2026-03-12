import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { addWeeks, subWeeks, startOfWeek, format, getWeek } from 'date-fns'
import attendanceApi from '@/apis/attendance.api'
import { ScheduleByShiftTable } from './components/ScheduleByShiftTable'
import { SummaryByEmployeeTable } from './components/SummaryByEmployeeTable'
import { AttendanceLegend } from './components/AttendanceLegend'
import { AttendanceModal } from './components/AttendanceModal'

type ViewMode = 'shift' | 'employee'

export default function AttendanceBoard() {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('shift')
  const [weekStart, setWeekStart] = useState(() => {
    const d = startOfWeek(new Date(), { weekStartsOn: 1 })
    return d
  })
  const [modalUserId, setModalUserId] = useState<number | null>(null)
  const [modalShiftId, setModalShiftId] = useState<number | null>(null)
  const [modalWorkDate, setModalWorkDate] = useState<string | null>(null)

  const weekStartStr = format(weekStart, 'yyyy-MM-dd')
  const periodLabel = useMemo(() => {
    const weekNum = getWeek(weekStart, { weekStartsOn: 1 })
    const month = format(weekStart, 'MM')
    const year = format(weekStart, 'yyyy')
    return `Tuần ${weekNum} - Th. ${month} ${year}`
  }, [weekStart])

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['attendances', 'schedule', weekStartStr, search],
    queryFn: () =>
      attendanceApi.getWeeklySchedule({ date: weekStartStr, search: search || undefined }),
    select: (r) => r.data?.data
  })

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['attendances', 'summary', weekStartStr, search],
    queryFn: () =>
      attendanceApi.getAttendanceSummary({ date: weekStartStr, search: search || undefined }),
    select: (r) => r.data?.data
  })

  const goPrevWeek = () => setWeekStart((d) => subWeeks(d, 1))
  const goNextWeek = () => setWeekStart((d) => addWeeks(d, 1))

  const openModal = (userId: number, shiftId?: number, workDate?: string) => {
    setModalUserId(userId)
    setModalShiftId(shiftId ?? null)
    setModalWorkDate(workDate ?? null)
  }

  const closeModal = () => {
    setModalUserId(null)
    setModalShiftId(null)
    setModalWorkDate(null)
  }

  const isLoading = viewMode === 'shift' ? scheduleLoading : summaryLoading

  return (
    <div className='space-y-6 animate-in fade-in duration-300'>
      <h1 className='text-2xl font-bold text-foreground'>Bảng chấm công</h1>

      <div className='bg-card border-border flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative max-w-xs'>
            <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Tìm kiếm nhân viên'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9'
            />
          </div>
          <select
            className='border-input bg-background h-9 rounded-md border px-3 text-sm'
            value='week'
          >
            <option value='week'>Theo tuần</option>
          </select>
          <div className='flex items-center gap-1 rounded-md border border-border bg-muted/30 px-1'>
            <button
              type='button'
              onClick={goPrevWeek}
              className='text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors'
              aria-label='Tuần trước'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <span className='min-w-[160px] px-2 text-center text-sm font-medium'>
              {periodLabel}
            </span>
            <button
              type='button'
              onClick={goNextWeek}
              className='text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors'
              aria-label='Tuần sau'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          </div>
          <select
            className='border-input bg-background h-9 rounded-md border px-3 text-sm'
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
          >
            <option value='shift'>Xem theo ca</option>
            <option value='employee'>Xem theo nhân viên</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center rounded-xl border border-border bg-card py-16'>
          <p className='text-muted-foreground'>Đang tải...</p>
        </div>
      ) : viewMode === 'shift' && scheduleData ? (
        <ScheduleByShiftTable
          data={scheduleData}
          onCellClick={(userId, shiftId, workDate) => openModal(userId, shiftId, workDate)}
        />
      ) : summaryData ? (
        <SummaryByEmployeeTable data={summaryData} onChamCong={openModal} />
      ) : (
        <div className='rounded-xl border border-border bg-card py-12 text-center text-muted-foreground'>
          Không có dữ liệu
        </div>
      )}

      <AttendanceLegend />

      {modalUserId !== null && (
        <AttendanceModal
          userId={modalUserId}
          defaultShiftId={modalShiftId ?? undefined}
          defaultWorkDate={modalWorkDate ?? undefined}
          onClose={closeModal}
          onSaved={closeModal}
        />
      )}
    </div>
  )
}

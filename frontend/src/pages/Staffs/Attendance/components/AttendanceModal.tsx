import { useState, useEffect } from 'react'
import { X, User, CalendarDays } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import attendanceApi from '@/apis/attendance.api'
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_TYPE_LABELS,
  type EAttendanceType
} from '@/types/attendance.type'
import type { ShiftResponse } from '@/types/attendance.type'
import { toast } from 'sonner'

interface AttendanceModalProps {
  userId: number
  defaultShiftId?: number
  defaultWorkDate?: string
  onClose: () => void
  onSaved?: () => void
}

type TabId = 'form' | 'history'

export function AttendanceModal({
  userId,
  defaultShiftId,
  defaultWorkDate,
  onClose,
  onSaved
}: AttendanceModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('form')
  const queryClient = useQueryClient()

  const workDateDefault = defaultWorkDate
    ? format(parseISO(defaultWorkDate), 'dd/MM/yyyy')
    : format(new Date(), 'dd/MM/yyyy')

  const [workDate, setWorkDate] = useState(workDateDefault)
  const [shiftId, setShiftId] = useState<number>(defaultShiftId ?? 0)
  const [note, setNote] = useState('')
  const [attendanceType, setAttendanceType] = useState<EAttendanceType>('WORKING')
  const [hasPunchIn, setHasPunchIn] = useState(true)
  const [hasPunchOut, setHasPunchOut] = useState(true)
  const [checkInAt, setCheckInAt] = useState('08:00')
  const [checkOutAt, setCheckOutAt] = useState('12:00')

  const { data: employeeInfo } = useQuery({
    queryKey: ['attendances', 'employee', userId],
    queryFn: () => attendanceApi.getEmployeeInfo(userId),
    select: (r) => r.data?.data
  })

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => attendanceApi.getAllShifts(),
    select: (r) => r.data?.data ?? []
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['attendances', 'history', userId],
    queryFn: () => attendanceApi.getHistory(userId, 0, 20),
    select: (r) => r.data?.data,
    enabled: activeTab === 'history'
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Parameters<typeof attendanceApi.saveRecord>[0]) =>
      attendanceApi.saveRecord(payload),
    onSuccess: () => {
      toast.success('Lưu chấm công thành công')
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
      onSaved?.()
    }
  })

  useEffect(() => {
    if (defaultShiftId && !shiftId) setShiftId(defaultShiftId)
  }, [defaultShiftId, shiftId])

  const currentStatus = employeeInfo?.currentStatus
  const statusLabel = currentStatus ? ATTENDANCE_STATUS_LABELS[currentStatus] : ''
  const statusColor = currentStatus ? ATTENDANCE_STATUS_COLORS[currentStatus] : ''

  const handleSave = () => {
    const [d, m, y] = workDate.split('/').map(Number)
    if (!d || !m || !y) {
      toast.error('Chọn ngày hợp lệ')
      return
    }
    const dateStr = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
    const checkInDateTime = hasPunchIn ? `${dateStr} ${checkInAt}` : undefined
    const checkOutDateTime = hasPunchOut ? `${dateStr} ${checkOutAt}` : undefined

    saveMutation.mutate({
      userId,
      workDate: dateStr,
      shiftId,
      note: note || undefined,
      attendanceType,
      hasPunchIn: attendanceType === 'WORKING' ? hasPunchIn : false,
      hasPunchOut: attendanceType === 'WORKING' ? hasPunchOut : false,
      checkInAt: checkInDateTime,
      checkOutAt: checkOutDateTime
    })
  }

  const historyList = historyData?.content ?? []

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role='dialog'
      aria-modal='true'
    >
      <div
        className={cn(
          'bg-card border-border flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-lg',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='border-border flex items-center justify-between border-b p-6'>
          <h2 className='text-xl font-bold text-foreground'>Chấm công</h2>
          <button
            type='button'
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground rounded p-1 transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {employeeInfo && (
          <div className='border-border flex flex-wrap items-center gap-4 border-b bg-muted/20 px-6 py-3'>
            <span className='text-muted-foreground flex items-center gap-2 text-sm'>
              <User className='h-4 w-4' />
              Nhân viên: {employeeInfo.fullName}
            </span>
            <span className='text-muted-foreground flex items-center gap-2 text-sm'>
              <CalendarDays className='h-4 w-4' />
              Mã NV: {employeeInfo.staffCode}
            </span>
            {currentStatus && (
              <span
                className={cn(
                  'rounded-full px-3 py-0.5 text-xs font-medium text-white',
                  statusColor
                )}
              >
                {statusLabel}
              </span>
            )}
          </div>
        )}

        <div className='border-border flex border-b'>
          <button
            type='button'
            onClick={() => setActiveTab('form')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'form'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Chấm công
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('history')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'history'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Lịch sử chấm công
          </button>
        </div>

        <div className='overflow-y-auto p-6'>
          {activeTab === 'form' && (
            <div className='space-y-4'>
              <div>
                <Label className='mb-1.5 block'>Thời gian</Label>
                <Input
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  placeholder='dd/MM/yyyy'
                />
              </div>
              <div>
                <Label className='mb-1.5 block'>Ca làm việc</Label>
                <select
                  className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
                  value={shiftId}
                  onChange={(e) => setShiftId(Number(e.target.value))}
                >
                  <option value={0}>Chọn ca</option>
                  {shifts.map((s: ShiftResponse) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className='mb-1.5 block'>Ghi chú</Label>
                <textarea
                  className='border-input bg-background placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm min-h-[80px]'
                  placeholder='Nhập ghi chú...'
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div>
                <Label className='mb-2 block'>Hình thức</Label>
                <div className='flex flex-wrap gap-4'>
                  {(['WORKING', 'LEAVE_WITH_PERMISSION', 'LEAVE_WITHOUT_PERMISSION'] as const).map(
                    (type) => (
                      <label key={type} className='flex cursor-pointer items-center gap-2'>
                        <input
                          type='radio'
                          name='attendanceType'
                          checked={attendanceType === type}
                          onChange={() => setAttendanceType(type)}
                          className='border-primary text-primary h-4 w-4'
                        />
                        <span className='text-sm'>{ATTENDANCE_TYPE_LABELS[type]}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
              {attendanceType === 'WORKING' && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={hasPunchIn}
                        onChange={(e) => setHasPunchIn(e.target.checked)}
                        className='rounded border-primary text-primary'
                      />
                      <span className='text-sm'>Vào</span>
                    </label>
                    <Input
                      type='time'
                      value={checkInAt}
                      onChange={(e) => setCheckInAt(e.target.value)}
                      disabled={!hasPunchIn}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={hasPunchOut}
                        onChange={(e) => setHasPunchOut(e.target.checked)}
                        className='rounded border-primary text-primary'
                      />
                      <span className='text-sm'>Ra</span>
                    </label>
                    <Input
                      type='time'
                      value={checkOutAt}
                      onChange={(e) => setCheckOutAt(e.target.value)}
                      disabled={!hasPunchOut}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className='overflow-x-auto rounded-md border border-border'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/30'>
                    <th className='px-4 py-2 text-left font-medium'>Thời gian</th>
                    <th className='px-4 py-2 text-left font-medium'>Trạng thái</th>
                    <th className='px-4 py-2 text-left font-medium'>Nội dung</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td colSpan={3} className='py-8 text-center text-muted-foreground'>
                        Đang tải...
                      </td>
                    </tr>
                  ) : historyList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className='py-8 text-center text-muted-foreground'>
                        Không có kết quả phù hợp
                      </td>
                    </tr>
                  ) : (
                    historyList.map((item) => (
                      <tr key={item.id} className='border-b border-border'>
                        <td className='px-4 py-2'>{item.time}</td>
                        <td className='px-4 py-2'>
                          {ATTENDANCE_STATUS_LABELS[item.status]}
                        </td>
                        <td className='px-4 py-2 text-muted-foreground'>
                          {item.content ?? '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className='border-border flex justify-end gap-2 border-t p-4'>
          <Button variant='destructive' onClick={onClose}>
            Hủy
          </Button>
          <Button variant='outline' onClick={onClose}>
            Bỏ qua
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !shiftId}
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  )
}

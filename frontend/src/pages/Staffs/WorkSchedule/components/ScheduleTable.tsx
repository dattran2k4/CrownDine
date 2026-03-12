import { useState } from 'react'
import { Info, Loader2, Trash2 } from 'lucide-react'
import { ScheduleCell } from './ScheduleCell'
import { AddScheduleModal } from './AddScheduleModal'
import { addDays, format, startOfWeek } from 'date-fns'
import useDeleteSchedule from '@/hooks/useDeleteSchedule'
import { toast } from 'react-toastify'
import { vi } from 'date-fns/locale'
import type { WorkScheduleResponse } from '@/types/workSchedule.type'
import type { Staff } from '@/types/profile.type'

interface ScheduleTableProps {
  isAdmin?: boolean
  currentDate: Date
  schedules: WorkScheduleResponse[]
  staffs: Staff[]
  isLoading: boolean
}

export function ScheduleTable({ isAdmin = false, currentDate, schedules, staffs, isLoading }: ScheduleTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null)
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; repeatGroupId?: string; workDate?: string } | null>(
    null
  )
  const deleteMutation = useDeleteSchedule()

  const handleDeleteClick = (shiftId: string, repeatGroupId?: string, workDate?: string) => {
    setDeleteTarget({ id: shiftId, repeatGroupId, workDate })
  }

  const confirmDelete = (deleteAll: boolean) => {
    if (!deleteTarget) return

    // For virtual schedules, we might need to send a slightly different payload.
    // If the backend accepts the negative ID to delete a template, deletePattern=true will handle it.
    deleteMutation.mutate(
      { id: deleteTarget.id, deletePattern: deleteAll, workDate: deleteTarget.workDate },
      {
        onSuccess: () => {
          toast.success('Xóa ca làm việc thành công')
          setDeleteTarget(null)
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi xóa ca làm việc')
        }
      }
    )
  }

  const handleAddShift = (rawStaffId: number, dateStr: string) => {
    setSelectedStaffId(rawStaffId)
    setSelectedDateForModal(dateStr)
    setIsModalOpen(true)
  }

  // Generate the 7 days of the current week
  const startDay = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }).map((_, i) => {
    const dateObj = addDays(startDay, i)
    return {
      name: format(dateObj, 'EEEE', { locale: vi }), // 'Thứ hai', etc.
      date: format(dateObj, 'd'), // '2', etc.
      fullDateStr: format(dateObj, 'yyyy-MM-dd'),
      current: format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    }
  })

  // Map backend response into grouped employees
  const employeesMap = new Map<number, any>()

  // 1. Initialize map with ALL staffs first
  staffs.forEach((staff) => {
    const numericId = Number(staff.id)
    employeesMap.set(numericId, {
      id: `NV${staff.id.toString().padStart(6, '0')}`,
      rawId: numericId,
      name: staff.firstName + ' ' + staff.lastName,
      salarySetting: 'Chưa thiết lập lương',
      schedule: []
    })
  })

  // 2. Populate schedules into the created map
  schedules.forEach((schedule) => {
    if (!employeesMap.has(schedule.user.id)) {
      employeesMap.set(schedule.user.id, {
        id: `NV${schedule.user.id.toString().padStart(6, '0')}`,
        rawId: schedule.user.id,
        name: schedule.user.fullName,
        salarySetting: 'Chưa thiết lập lương',
        schedule: []
      })
    }

    const emp = employeesMap.get(schedule.user.id)
    // Find which day index this schedule corresponds to
    const dayIndex = days.findIndex((d) => d.fullDateStr === schedule.workDate)

    if (dayIndex !== -1) {
      let daySch = emp.schedule.find((s: any) => s.dayIndex === dayIndex)
      if (!daySch) {
        daySch = { dayIndex, shifts: [] }
        emp.schedule.push(daySch)
      }
      // Define color logic based on shift? For now keeping it default blue
      daySch.shifts.push({
        id: schedule.id.toString(),
        name: schedule.shift.name,
        colorClass: 'bg-[#E6F4FF] text-[#003A8C]',
        repeatGroupId: schedule.repeatGroupId,
        startTime: schedule.shift.startTime,
        endTime: schedule.shift.endTime
      })
    }
  })
  const employees = Array.from(employeesMap.values())

  return (
    <div className='border-border overflow-hidden rounded-b-xl border bg-white'>
      <table className='w-full text-sm'>
        <thead className='border-border border-b bg-white'>
          <tr>
            <th className='border-border min-w-[200px] border-r p-4 text-left font-bold'>Nhân viên</th>
            {days.map((d, i) => (
              <th key={i} className='border-border min-w-[120px] border-r px-2 py-4 text-center font-normal'>
                <div className='flex flex-col items-center justify-center gap-2 sm:flex-row'>
                  <span
                    className={d.current ? 'font-semibold text-green-600' : 'text-foreground font-semibold capitalize'}
                  >
                    {d.name}
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${
                      d.current ? 'bg-green-600 text-white' : 'text-foreground'
                    }`}
                  >
                    {d.date}
                  </span>
                </div>
              </th>
            ))}
            {isAdmin && (
              <th className='relative min-w-[160px] p-4 text-right font-semibold'>
                <div className='mb-1 flex items-center justify-end gap-1'>
                  Lương dự kiến <Info className='text-foreground h-4 w-4 cursor-pointer' />
                </div>
                <div className='text-lg leading-none font-bold'>0</div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className='divide-border divide-y'>
          {isLoading ? (
            <tr>
              <td colSpan={isAdmin ? 9 : 8} className='p-10 text-center'>
                <div className='flex justify-center'>
                  <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
                </div>
              </td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 9 : 8} className='text-muted-foreground p-10 text-center'>
                Không có lịch làm việc nào trong tuần này
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id} className='hover:bg-muted/5 transition-colors'>
                <td className='border-border border-r bg-white p-4 align-top'>
                  <div className='text-foreground mb-1 text-base font-bold'>{emp.name}</div>
                  <div className='text-muted-foreground text-xs'>{emp.id}</div>
                </td>
                {days.map((d, dayIdx) => {
                  const dayShifts = emp.schedule.find((s: any) => s.dayIndex === dayIdx)?.shifts || []
                  return (
                    <ScheduleCell
                      key={dayIdx}
                      isAdmin={isAdmin}
                      shifts={dayShifts}
                      dateStr={d.fullDateStr}
                      onAdd={() => handleAddShift(emp.rawId, d.fullDateStr)}
                      onDelete={handleDeleteClick}
                    />
                  )
                })}
                {isAdmin && (
                  <td className='bg-white p-4 text-right align-top'>
                    <span className='text-muted-foreground text-xs'>{emp.salarySetting}</span>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Render Add Schedule Modal Overlay */}
      {isModalOpen && selectedDateForModal && selectedStaffId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='animate-in fade-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl duration-200'>
            <div className='bg-muted/30 flex items-center justify-between border-b px-6 py-4'>
              <h2 className='text-lg font-bold'>Thêm phân ca làm việc</h2>
            </div>
            <div className='max-h-[80vh] overflow-y-auto'>
              <AddScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDateForModal}
                staffId={selectedStaffId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Render Delete Confirmation Modal */}
      {deleteTarget && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='animate-in fade-in zoom-in-95 relative w-full max-w-sm overflow-hidden rounded-xl bg-white p-6 shadow-xl duration-200'>
            <div className='mb-4 flex items-center gap-3 text-red-600'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100'>
                <Trash2 className='h-5 w-5' />
              </div>
              <h2 className='text-lg font-bold text-slate-900'>Xóa ca làm việc</h2>
            </div>

            <p className='mb-6 text-sm text-slate-600'>
              {deleteTarget.repeatGroupId
                ? 'Đây là ca làm việc lặp lại. Bạn muốn xóa nguyên chuỗi lặp này hay chỉ xóa riêng ngày hôm nay?'
                : 'Bạn có chắc chắn muốn xóa ca làm việc này không? Hành động này không thể hoàn tác.'}
            </p>

            <div className='flex flex-col gap-2'>
              {deleteTarget.repeatGroupId && (
                <button
                  onClick={() => confirmDelete(true)}
                  className='w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700'
                >
                  Xóa tất cả các ca lặp lại
                </button>
              )}
              <button
                onClick={() => confirmDelete(false)}
                className='w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100'
              >
                {deleteTarget.repeatGroupId ? 'Chỉ xóa ca hôm nay' : 'Đồng ý xóa'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className='mt-2 w-full rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100'
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

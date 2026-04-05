import { useState } from 'react'
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from 'date-fns'
import { ScheduleHeader } from './components/ScheduleHeader'
import { ScheduleTable } from './components/ScheduleTable'
import useWorkSchedule from '@/hooks/useWorkSchedule'
import useStaffs from '@/hooks/useStaffs'

interface WorkScheduleProps {
  isAdmin?: boolean
}

const WorkSchedule = ({ isAdmin = false }: WorkScheduleProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedStaffSearchIds, setSelectedStaffSearchIds] = useState<string[]>([])

  // Bắt đầu tuần từ Thứ Hai
  const fromDate = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const toDate = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const { data: schedules, isLoading } = useWorkSchedule({
    fromDate,
    toDate
  })

  // Fetch full list of staffs to display on the left col
  const { data: staffs, isLoading: isStaffLoading } = useStaffs()

  const nextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1))
  const prevWeek = () => setCurrentDate((prev) => subWeeks(prev, 1))
  const thisWeek = () => setCurrentDate(new Date())

  // Filter logic for ScheduleTable
  const filteredStaffs = staffs ? (selectedStaffSearchIds.length > 0 ? staffs.filter(s => selectedStaffSearchIds.includes(s.id)) : staffs) : []
  const filteredSchedules = schedules ? (selectedStaffSearchIds.length > 0 ? schedules.filter(s => selectedStaffSearchIds.includes(s.user.id.toString())) : schedules) : []

  return (
    <div className='bg-muted/10 h-full min-h-[calc(100vh-64px)] p-6'>
      <div className='mx-auto max-w-[1600px]'>
        <div className='border-border rounded-t-xl border border-b-0 bg-card text-card-foreground px-4 pt-2 shadow-sm'>
          <ScheduleHeader
            isAdmin={isAdmin}
            currentDate={currentDate}
            staffs={staffs || []}
            selectedStaffIds={selectedStaffSearchIds}
            onStaffSelect={setSelectedStaffSearchIds}
            onNextWeek={nextWeek}
            onPrevWeek={prevWeek}
            onThisWeek={thisWeek}
          />
        </div>
        <div className='shadow-sm'>
          <ScheduleTable
            isAdmin={isAdmin}
            currentDate={currentDate}
            schedules={filteredSchedules}
            staffs={filteredStaffs}
            isLoading={isLoading || isStaffLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default WorkSchedule

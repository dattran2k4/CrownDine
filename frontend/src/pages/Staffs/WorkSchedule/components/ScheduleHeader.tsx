import { Search, ChevronLeft, ChevronRight, User, Upload, Download, X, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, getWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useState, useRef, useEffect } from 'react'
import type { Staff } from '@/types/profile.type'

interface ScheduleHeaderProps {
  isAdmin?: boolean
  currentDate: Date
  staffs: Staff[]
  selectedStaffIds: string[]
  onStaffSelect: (ids: string[]) => void
  onNextWeek: () => void
  onPrevWeek: () => void
  onThisWeek: () => void
}

export function ScheduleHeader({
  isAdmin = false,
  currentDate,
  staffs = [],
  selectedStaffIds = [],
  onStaffSelect,
  onNextWeek,
  onPrevWeek,
  onThisWeek
}: ScheduleHeaderProps) {
  const weekNumber = getWeek(currentDate, { weekStartsOn: 1 })
  const month = format(currentDate, 'M', { locale: vi })
  const year = format(currentDate, 'yyyy')

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedStaffs = staffs.filter((s) => selectedStaffIds.includes(s.id))

  const filteredStaffs = staffs.filter((staff) => {
    const idStr = `NV${staff.id.toString().padStart(6, '0')}`
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || idStr.toLowerCase().includes(query)
  })

  const toggleStaffSelection = (id: string) => {
    if (selectedStaffIds.includes(id)) {
      onStaffSelect(selectedStaffIds.filter((selectedId) => selectedId !== id))
    } else {
      onStaffSelect([...selectedStaffIds, id])
      setSearchQuery('')
    }
  }

  return (
    <div className='flex items-center justify-between pb-4'>
      <h1 className='text-xl font-bold'>Lịch làm việc</h1>
      <div className='flex flex-1 items-center justify-end gap-3'>
        <div className='relative w-64' ref={dropdownRef}>
          <div className='border-input ring-offset-background flex min-h-10 w-full cursor-pointer items-center justify-between rounded-md border bg-white px-3 py-1.5 text-sm'>
            <div
              className='flex flex-1 flex-wrap items-center gap-2 overflow-hidden'
              onClick={() => setIsDropdownOpen(true)}
            >
              <Search className='text-muted-foreground mr-1 h-4 w-4 shrink-0' />
              {selectedStaffs.map((staff) => (
                <div
                  key={staff.id}
                  className='flex items-center gap-1 rounded bg-[#E67E22] px-2 py-0.5 text-white'
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className='max-w-[120px] truncate font-medium'>
                    {staff.firstName} {staff.lastName}
                  </span>
                  <X
                    className='h-3.5 w-3.5 cursor-pointer hover:text-white/80'
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStaffSelection(staff.id)
                    }}
                  />
                </div>
              ))}
              <input
                placeholder={selectedStaffs.length === 0 ? 'Tìm kiếm nhân viên' : ''}
                className='placeholder:text-muted-foreground min-w-[60px] flex-1 bg-transparent outline-none'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
              />
            </div>
            <ChevronDown
              className='ml-2 h-4 w-4 shrink-0 opacity-50'
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
          </div>

          {isDropdownOpen && (
            <div className='bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-white shadow-md outline-none'>
              <div className='max-h-60 overflow-auto p-1'>
                {filteredStaffs.length === 0 ? (
                  <div className='text-muted-foreground py-6 text-center text-sm'>Không tìm thấy nhân viên.</div>
                ) : (
                  filteredStaffs.map((staff) => {
                    const isSelected = selectedStaffIds.includes(staff.id)
                    const idStr = `NV${staff.id.toString().padStart(6, '0')}`
                    return (
                      <div
                        key={staff.id}
                        className={`hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-pointer items-center rounded-sm py-2 pr-9 pl-3 text-sm outline-none select-none ${isSelected ? 'bg-orange-50/50' : ''}`}
                        onClick={() => {
                          toggleStaffSelection(staff.id)
                          if (!isSelected) {
                            setIsDropdownOpen(false) // Close on select (optional, can stay open to multi-select fast)
                          }
                        }}
                      >
                        <div className='flex flex-col'>
                          <span className='font-semibold text-slate-900'>
                            {staff.firstName} {staff.lastName}
                          </span>
                          <span className='text-slate-500'>{idStr}</span>
                        </div>
                        {isSelected && (
                          <span className='absolute right-3 flex h-3.5 w-3.5 items-center justify-center text-[#E67E22]'>
                            <Check className='h-4 w-4' />
                          </span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className='border-border hover:bg-muted/5 flex h-10 items-center gap-1 rounded-md border bg-white px-1 transition-colors'>
          <Button variant='ghost' size='icon' onClick={onPrevWeek} className='hover:bg-muted h-8 w-8 rounded-sm p-0'>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='px-2 text-sm font-medium whitespace-nowrap'>
            Tuần {weekNumber} - Th. {month} {year}
          </span>
          <Button variant='ghost' size='icon' onClick={onNextWeek} className='hover:bg-muted h-8 w-8 rounded-sm p-0'>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        <Button variant='outline' className='bg-white' onClick={onThisWeek}>
          Tuần này
        </Button>
        <Button variant='outline' className='flex items-center gap-2 bg-white'>
          <User className='h-4 w-4' />
          Xem theo nhân viên
        </Button>

        {isAdmin && (
          <>
            <Button variant='outline' className='flex items-center gap-2 bg-white'>
              <Upload className='h-4 w-4' /> Import
            </Button>
            <Button variant='outline' className='flex items-center gap-2 bg-white'>
              <Download className='h-4 w-4' /> Xuất file
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

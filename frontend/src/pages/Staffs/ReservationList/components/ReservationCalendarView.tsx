import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import tableApi from '@/apis/table.api'
import reservationApi from '@/apis/reservation.api'
import { format, isSameDay, addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, PlusCircle, Search } from 'lucide-react'
import type { StaffReservationResponse } from '@/types/reservation.type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import clsx from 'clsx'
import type { Table } from '@/types/table.type'

interface ReservationCalendarViewProps {
  onOpenCreateModal: () => void
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 08:00 to 22:00
const COLUMN_WIDTH = 120 // px per hour

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'Đã xếp bàn', color: 'bg-green-500' },
  CHECKED_IN: { label: 'Đã nhận bàn', color: 'bg-blue-500' },
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-500' },
  NO_SHOW: { label: 'Quá giờ / Không đến', color: 'bg-gray-500' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-500' }
}

const ReservationCalendarView = ({ onOpenCreateModal }: ReservationCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const { data: tablesData = [] as Table[], isLoading: isTablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getAllTables(),
    select: (res) => res.data?.data || []
  })

  // Group tables by Floor (if possible, otherwise just one group)
  const groupedTables = useMemo(() => {
    const groups: Record<string, Table[]> = {}
    
    tablesData.forEach((t: Table) => {
      // Logic: If table name is "201", group to "Tầng 2". If "Bàn 1", group to "Khu vực 1"
      let floor = 'Khu vực chính'
      if (t.name.match(/^[1-9]\d{2}/)) { // Starts with 3 digits like 1xx, 2xx
         floor = `Tầng ${t.name.charAt(0)}`
      } else if (t.name.toLowerCase().includes('lầu')) {
         const match = t.name.match(/lầu\s*(\d+)/i)
         if (match) floor = `Tầng ${match[1]}`
      }
      
      if (!groups[floor]) groups[floor] = []
      groups[floor].push(t)
    })
    
    return groups
  }, [tablesData])

  const { data: reservations = [] as StaffReservationResponse[] } = useQuery({
    queryKey: ['staff-reservations-calendar', dateStr],
    queryFn: () => reservationApi.getAllReservations({ fromDate: dateStr, toDate: dateStr, size: 200 }),
    select: (res) => res.data?.data?.data || []
  })

  const filteredReservations = useMemo(() => {
    if (!searchTerm) return reservations
    return reservations.filter((r: StaffReservationResponse) => 
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.phone?.includes(searchTerm) || 
      r.code?.includes(searchTerm)
    )
  }, [reservations, searchTerm])

  const getTimeOffset = (timeStr: string) => {
    if (!timeStr) return 0
    const [h, m] = timeStr.split(':').map(Number)
    const baseHour = 8
    const totalMinutes = (h - baseHour) * 60 + m
    return (totalMinutes / 60) * COLUMN_WIDTH
  }

  const getDurationWidth = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return COLUMN_WIDTH * 1.5 // Default 1.5h
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm)
    return (totalMinutes / 60) * COLUMN_WIDTH
  }

  const currentTimeOffset = useMemo(() => {
     const now = new Date()
     if (!isSameDay(now, selectedDate)) return null
     const h = now.getHours()
     const m = now.getMinutes()
     if (h < 8 || h > 22) return null
     return ((h - 8) * 60 + m) / 60 * COLUMN_WIDTH
  }, [selectedDate])

  if (isTablesLoading) return <div className='p-10 text-center'>Đang tải sơ đồ bàn...</div>

  return (
    <div className='flex flex-col h-full bg-white text-slate-800 rounded-xl overflow-hidden border border-slate-200 shadow-sm'>
      {/* 1. Sub-Header Toolbar */}
      <div className='flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200'>
        <div className='flex items-center gap-4'>
           <div className='flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm'>
              <button className='px-4 py-1.5 text-[10px] font-black uppercase bg-primary text-white rounded-md'>Ngày</button>
              <button className='px-4 py-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 transition-colors'>Tuần</button>
              <button className='px-4 py-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 transition-colors'>Tháng</button>
           </div>
           
           <div className='flex items-center bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden'>
              <button 
                onClick={() => setSelectedDate(prev => subDays(prev, 1))}
                className='p-2 hover:bg-slate-50 text-slate-400 transition-colors border-r border-slate-100'
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setSelectedDate(new Date())}
                className='px-3 py-1 bg-white text-[9px] uppercase font-black text-slate-400 hover:text-primary transition-colors border-r border-slate-100'
              >
                Hôm nay
              </button>
              <div className='px-4 font-bold text-xs min-w-[120px] text-center text-slate-600'>
                {format(selectedDate, 'dd/MM/yyyy')}
              </div>
              <button 
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                className='p-2 hover:bg-slate-50 text-slate-400 transition-colors border-l border-slate-100'
              >
                <ChevronRight size={16} />
              </button>
           </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative'>
             <Input 
                className='pl-8 w-[240px] h-9 text-xs border-slate-200 focus:border-primary shadow-sm bg-white' 
                placeholder='Lọc theo khách hàng...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className='absolute left-2.5 top-2 text-slate-300' size={14} />
          </div>
          <Button onClick={onOpenCreateModal} className='h-9 gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95 font-bold text-xs px-4 rounded-lg'>
             <PlusCircle size={14} /> ĐẶT BÀN (F1)
          </Button>
        </div>
      </div>

      {/* 2. Legend / Filters */}
      <div className='flex flex-wrap items-center gap-6 px-6 py-2.5 bg-white border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-wider'>
         {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className='flex items-center gap-2'>
               <div className={clsx('w-3 h-3 rounded-sm', config.color)}></div>
               <span>{config.label}</span>
            </div>
         ))}
      </div>

      {/* 3. Main Timeline Grid */}
      <div className='flex-1 overflow-auto bg-slate-50 relative'>
        <div className='inline-flex min-w-full flex-col'>
          {/* Timeline Header (Sticky) */}
          <div className='flex sticky top-0 z-30 bg-slate-50 border-b border-slate-200'>
            <div className='w-48 flex-shrink-0 bg-slate-100/50 p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 flex items-center justify-center'>
               Phòng / Bàn
            </div>
            <div className='flex'>
              {HOURS.map(hour => (
                <div 
                  key={hour} 
                  style={{ width: `${COLUMN_WIDTH}px` }} 
                  className='flex-shrink-0 p-3 text-center border-r border-slate-200/50 text-[10px] font-black text-slate-400'
                >
                  {hour}:00
                </div>
              ))}
            </div>
          </div>

          {/* Floor Groupings & Table Rows */}
          {Object.entries(groupedTables).map(([floor, tables]) => (
            <div key={floor}>
               {/* Floor Header */}
               <div className='flex bg-slate-100/50 border-b border-slate-200'>
                  <div className='w-48 bg-slate-200/30 p-2 pl-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 flex items-center'>
                     {floor}
                  </div>
                  <div className='flex-1 h-8'></div>
               </div>

               {/* Table Rows under this floor */}
               {tables?.map((table: Table) => {
                  const tableReservations = (filteredReservations || []).filter((r: StaffReservationResponse) => r.tableName === table.name)
                  
                  return (
                    <div key={table.id} className='flex border-b border-slate-200 group hover:bg-white transition-colors h-14'>
                       {/* Left Table Label */}
                       <div className='w-48 flex-shrink-0 bg-white p-3 font-semibold text-sm border-r border-slate-200 flex items-center gap-2 shadow-sm'>
                          <div className='w-2 h-2 rounded-full bg-slate-200 group-hover:bg-primary transition-colors'></div>
                          {table.name} 
                          <span className='text-[10px] text-slate-400 font-normal ml-auto'>({table.capacity} ghế)</span>
                       </div>

                       {/* Horizontal Track with Reservation Blocks */}
                       <div className='flex relative bg-slate-50/30 group-hover:bg-white/10 transition-colors'>
                          {HOURS.map(hour => (
                             <div 
                                key={hour} 
                                style={{ width: `${COLUMN_WIDTH}px` }} 
                                className='flex-shrink-0 border-r border-slate-200/50 h-full'
                             ></div>
                          ))}

                          {(tableReservations || []).map((res: StaffReservationResponse) => {
                             const offset = getTimeOffset(res.startTime)
                             const width = getDurationWidth(res.startTime, res.endTime)
                             const config = STATUS_CONFIG[res.status] || STATUS_CONFIG.CONFIRMED

                             return (
                               <div 
                                 key={res.id}
                                 style={{ 
                                    left: `${offset}px`,
                                    width: `${width - 4}px`,
                                    top: '8px'
                                 }}
                                 className={clsx(
                                   'absolute h-10 rounded-lg shadow-sm border border-white/20 p-2 text-[10px] sm:text-xs overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 group/block z-10',
                                   config.color,
                                   'text-white'
                                 )}
                               >
                                  <div className='font-bold truncate drop-shadow-sm flex items-center gap-1'>
                                     {res.customerName}
                                  </div>
                                  <div className='flex items-center gap-1 opacity-90 truncate font-medium'>
                                      👤 {res.guestNumber} • {res.startTime.substring(0, 5)}
                                  </div>
                               </div>
                             )
                          })}
                       </div>
                    </div>
                  )
               })}
            </div>
          ))}

          {/* Current Time Indicator Line */}
          {currentTimeOffset !== null && (
             <div 
                className='absolute top-0 bottom-0 w-0.5 bg-red-500 z-40 pointer-events-none' 
                style={{ left: `${currentTimeOffset + 192}px` }} // +192px for the offset of the left sidebar (w-48 = 192px)
             >
                <div className='w-3 h-3 bg-red-500 rounded-full absolute -top-1.5 -left-1.25 shadow-md'></div>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReservationCalendarView

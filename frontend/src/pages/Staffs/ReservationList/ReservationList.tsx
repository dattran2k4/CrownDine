import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import reservationApi from '@/apis/reservation.api'
import clsx from 'clsx'
import { queryClient } from '@/main'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import type { StaffReservationResponse } from '@/types/reservation.type'
import { useAuthStore } from '@/stores/useAuthStore'
import { PlusCircle, Search, Check } from 'lucide-react'
import CreateReservationModal from './components/CreateReservationModal'
import ReservationCalendarView from './components/ReservationCalendarView'
import ReservationDetailModal from './components/ReservationDetailModal'
import tableApi from '@/apis/table.api'

type ViewMode = 'LIST' | 'CALENDAR'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận bàn',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
  NO_SHOW: 'Không đến'
}

const ReservationList = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [viewMode, setViewMode] = useState<ViewMode>('CALENDAR')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<StaffReservationResponse | null>(null)
  const [initialBookingData, setInitialBookingData] = useState<any>(null)
  
  // Advanced Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [activeFloor, setActiveFloor] = useState('Tất cả')
  const [activeArea, setActiveArea] = useState('Tất cả')

  const { data: reservations } = useQuery({
    queryKey: ['staff-reservations', statusFilter],
    queryFn: () => reservationApi.getAllReservations({ status: statusFilter || undefined, size: 100 }),
    select: (res) => res.data?.data?.data || []
  })

  // Fetch Tables once for filter data
  const { data: tableData } = useQuery({
    queryKey: ['tables-filter'],
    queryFn: () => tableApi.getAllTables()
  })

  const rawTables = tableData?.data.data || []

  // Filter UI data
  const floors = ['Tất cả', ...Array.from(new Set(rawTables.map((t: any) => t.floorName).filter(Boolean)))]
  const areas = ['Tất cả', ...Array.from(new Set((rawTables as any[]).filter(t => activeFloor === 'Tất cả' || t.floorName === activeFloor).map(t => t.areaName).filter(Boolean)))]

  const checkInMutation = useMutation({
    mutationFn: async (reservation: StaffReservationResponse) =>
      reservationApi.checkInReservation(reservation.id, user?.id),
    onSuccess: () => {
      toast.success('Check in đặt bàn thành công')
      setSelectedReservation(null)
      queryClient.invalidateQueries({ queryKey: ['staff-reservations'] })
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (reservationId: number) => reservationApi.cancelReservationByStaff(reservationId),
    onSuccess: () => {
      toast.success('Huỷ đặt bàn thành công')
      queryClient.invalidateQueries({ queryKey: ['staff-reservations'] })
    }
  })

  const filteredReservations = (reservations || []).filter((r: StaffReservationResponse) => {
    // 1. Status Filter
    if (statusFilter && r.status !== statusFilter) return false

    // 2. Floor Filter
    if (activeFloor !== 'Tất cả' && r.floorName !== activeFloor) return false

    // 3. Area Filter
    if (activeArea !== 'Tất cả' && r.areaName !== activeArea) return false

    return true
  })

  return (
    <div className='flex min-h-screen bg-white'>
      {/* 1. SIDEBAR (Left) */}
      <aside className='w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0 z-30'>
         <div className='p-6 border-b border-slate-100 bg-slate-50/10'>
            <h2 className='text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2'>
               <Search size={14} /> Bộ lọc nâng cao
            </h2>
         </div>
         
         <div className='p-6 space-y-8 overflow-y-auto'>
            {/* Status checkboxes */}
            <div>
               <label className='block text-[10px] font-black text-slate-400 uppercase mb-3 px-1 tracking-widest'>Trạng thái đơn</label>
               <div className='space-y-1.5'>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <button 
                      key={k} 
                      onClick={() => setStatusFilter(statusFilter === k ? '' : k)}
                      className={clsx(
                         'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all',
                         statusFilter === k ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                       <span>{v}</span>
                       {statusFilter === k && <Check size={12} />}
                    </button>
                  ))}
               </div>
            </div>

            {/* Floor filter */}
            <div>
               <label className='block text-[10px] font-black text-slate-400 uppercase mb-3 px-1 tracking-widest'>Tầng / Lầu</label>
               <select 
                 className='w-full h-10 bg-slate-50 border-slate-200 rounded-lg text-sm px-3 outline-none cursor-pointer font-bold text-slate-700'
                 value={activeFloor}
                 onChange={(e) => {
                   setActiveFloor(e.target.value)
                   setActiveArea('Tất cả')
                 }}
               >
                  {floors.map(f => <option key={f} value={f}>{f}</option>)}
               </select>
            </div>

            {/* Area filter */}
            <div>
               <label className='block text-[10px] font-black text-slate-400 uppercase mb-3 px-1 tracking-widest'>Khu vực / Phòng</label>
               <div className='flex flex-wrap gap-2'>
                  {areas.map(a => (
                    <button
                      key={a}
                      onClick={() => setActiveArea(a)}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight transition-all border',
                        activeArea === a ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-orange-300 hover:text-orange-500'
                      )}
                    >
                      {a}
                    </button>
                  ))}
               </div>
            </div>

            {/* Table count */}
            <div className='pt-6 border-t border-slate-100'>
               <label className='block text-[10px] font-bold text-slate-400 uppercase mb-3 px-1'>Bản ghi hiển thị</label>
               <select className='w-full h-10 bg-slate-50 border-slate-200 rounded-lg text-sm px-2 outline-none cursor-pointer'>
                  <option>15 bản ghi</option>
                  <option>30 bản ghi</option>
                  <option>50 bản ghi</option>
               </select>
            </div>
         </div>
      </aside>

      {/* 2. MAIN CONTENT (Right) */}
      <main className='flex-1 flex flex-col min-w-0'>
        {/* Workspace Dashboard Header (Dark Blue) */}
        <header className='h-14 bg-[#003C71] flex items-center justify-between text-white shadow-md z-40 px-0'>
           <div className='flex items-center h-full'>
              <h1 className='text-sm font-black tracking-widest uppercase px-6 border-r border-white/10 h-full flex items-center'>Đặt bàn</h1>
              <nav className='flex h-full'>
                 <button 
                   onClick={() => setViewMode('CALENDAR')}
                   className={clsx(
                     'px-8 h-full font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 border-b-2',
                     viewMode === 'CALENDAR' ? 'bg-white/10 border-white text-white shadow-inner' : 'border-transparent text-white/40 hover:text-white/80'
                   )}
                 >
                   Theo lịch
                 </button>
                 <button 
                    onClick={() => setViewMode('LIST')}
                    className={clsx(
                      'px-8 h-full font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 border-b-2',
                      viewMode === 'LIST' ? 'bg-white/10 border-white text-white shadow-inner' : 'border-transparent text-white/40 hover:text-white/80'
                    )}
                 >
                   Theo danh sách
                 </button>
              </nav>
           </div>
           
           <div className='flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider pr-6'>
              <span className='opacity-60'>Chi nhánh trung tâm</span>
              <div className='w-px h-3 bg-white/20'></div>
              <span className='bg-primary/20 px-3 py-1 rounded-full border border-white/10'>Staff: {user?.firstName}</span>
           </div>
        </header>

        {/* Workspace Panel - No padding for Edge-to-Edge look */}
        <div className='flex-1 overflow-hidden flex flex-col bg-white'>
           {viewMode === 'CALENDAR' ? (
             <ReservationCalendarView 
               onOpenCreateModal={() => setIsCreateModalOpen(true)} 
               onSelectReservation={(res) => setSelectedReservation(res)}
               statusFilter={statusFilter}
               activeFloor={activeFloor}
               activeArea={activeArea}
               onSlotClick={(data) => {
                 setInitialBookingData(data)
                 setIsCreateModalOpen(true)
               }}
             />
           ) : (
             <div className='bg-white flex-1 overflow-hidden flex flex-col h-full border-b border-slate-200'>
                {/* Table Top Actions */}
                <div className='p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30'>
                   <div className='flex items-center gap-3'>
                      <input type='checkbox' className='w-4 h-4 rounded border-slate-300' />
                      <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Tất cả</span>
                   </div>
                   <div className='flex gap-2'>
                      <Button 
                         onClick={() => setIsCreateModalOpen(true)}
                         className='bg-primary gap-2 h-9 text-xs font-bold px-4 rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform'
                      >
                         <PlusCircle size={14} /> TẠO ĐẶT BÀN (F1)
                      </Button>
                   </div>
                </div>

                {/* Main Table Interface */}
                <div className='flex-1 overflow-auto bg-white'>
                   <table className='w-full text-left border-collapse'>
                      <thead className='sticky top-0 bg-slate-50 border-b border-slate-200 z-10'>
                         <tr>
                            <th className='p-4 w-10'></th>
                            <th className='p-4 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter'>Mã đặt bàn</th>
                            <th className='p-4 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter'>Giờ đến</th>
                            <th className='p-4 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter'>Khách hàng</th>
                            <th className='p-4 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter'>Điện thoại</th>
                            <th className='p-4 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter'>Số khách</th>
                            <th className='p-4 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter'>Phòng/bàn</th>
                            <th className='p-4 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter'>Trạng thái</th>
                            <th className='p-4 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap tracking-tighter text-center'>Ghi chú</th>
                         </tr>
                      </thead>
                      <tbody>
                         {filteredReservations.map((res: StaffReservationResponse) => (
                            <tr 
                               key={res.id} 
                               onClick={() => setSelectedReservation(res)}
                               className='border-b border-slate-100 hover:bg-slate-50/50 transition-colors group cursor-pointer'
                            >
                               <td className='p-4'><input type='checkbox' className='rounded border-slate-300' /></td>
                               <td className='p-4 font-bold text-primary text-sm'>#{res.code?.substring(0, 8).toUpperCase()}</td>
                               <td className='p-4 text-xs font-semibold text-slate-500'>
                                  <div className='font-bold text-slate-700'>{res.startTime.substring(0, 5)}</div>
                                  <div className='text-[10px]'>{res.date}</div>
                               </td>
                               <td className='p-4 font-bold text-slate-700 text-sm'>{res.customerName}</td>
                               <td className='p-4 text-xs text-slate-500 font-medium'>{res.phone || 'N/A'}</td>
                               <td className='p-4 font-black text-slate-700 text-sm text-center'>{res.guestNumber}</td>
                               <td className='p-4 text-xs font-bold text-slate-600'>{res.tableName || 'Chưa xếp'}</td>
                               <td className='p-4'>
                                  <div className='flex items-center gap-2'>
                                     <div className={clsx(
                                       'w-1.5 h-1.5 rounded-full ring-2 ring-offset-1',
                                       res.status === 'PENDING' ? 'bg-yellow-500 ring-yellow-400/30' : 
                                       res.status === 'CONFIRMED' ? 'bg-blue-500 ring-blue-400/30' :
                                       res.status === 'CHECKED_IN' ? 'bg-emerald-500 ring-emerald-400/30' : 
                                       res.status === 'CANCELLED' ? 'bg-red-500 ring-red-400/30' : 'bg-slate-400 ring-slate-300/30'
                                     )}></div>
                                     <span className='text-[10px] font-black text-slate-500 uppercase whitespace-nowrap'>
                                        {STATUS_LABELS[res.status] || res.status}
                                     </span>
                                  </div>
                               </td>
                               <td className='p-4'>
                                  <div className='flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                     {res.status === 'CONFIRMED' && (
                                       <button 
                                          onClick={() => checkInMutation.mutate(res)}
                                          className='p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-md transition-all shadow-sm' 
                                          title='Check-in'
                                       >
                                          <Check size={14} />
                                       </button>
                                     )}
                                     <button 
                                        className='p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-all shadow-sm'
                                        title='Cập nhật'
                                        onClick={() => navigate('/staff/order-management', { state: { reservationId: res.id } })}
                                     >
                                        <Search size={14} />
                                     </button>
                                     <button 
                                        onClick={() => cancelMutation.mutate(res.id)}
                                        className='p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all shadow-sm' 
                                        title='Huỷ'
                                     >
                                        ✕
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                   
                   {filteredReservations.length === 0 && (
                      <div className='py-24 text-center'>
                         <p className='text-slate-300 font-black uppercase tracking-widest text-sm italic'>Dữ liệu trống</p>
                      </div>
                   )}
                </div>

                {/* Pagination Status Bar */}
                <div className='p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                   <div className='flex items-center gap-1.5'>
                      <button className='w-5 h-5 border border-slate-200 rounded flex items-center justify-center hover:bg-white'>‹</button>
                      <button className='w-5 h-5 bg-primary text-white rounded flex items-center justify-center shadow-md'>1</button>
                      <button className='w-5 h-5 border border-slate-200 rounded flex items-center justify-center hover:bg-white'>2</button>
                      <button className='w-5 h-5 border border-slate-200 rounded flex items-center justify-center hover:bg-white'>›</button>
                   </div>
                   <div>Hiển thị {filteredReservations.length} kết quả</div>
                </div>
             </div>
           )}
        </div>
      </main>

      <CreateReservationModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false)
          setInitialBookingData(null)
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['staff-reservations'] })
          queryClient.invalidateQueries({ queryKey: ['staff-reservations-calendar'] })
          queryClient.invalidateQueries({ queryKey: ['tables-filter'] })
        }}
        initialData={initialBookingData}
      />

      <ReservationDetailModal
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        reservation={selectedReservation}
        onCheckIn={(res) => checkInMutation.mutate(res)}
        onCancel={(id) => cancelMutation.mutate(id)}
        isMutating={checkInMutation.isPending || cancelMutation.isPending}
      />
    </div>
  )
}

export default ReservationList

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { useMutation, useQuery } from '@tanstack/react-query'
import reservationApi from '@/apis/reservation.api'
import clsx from 'clsx'
import { queryClient } from '@/main'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import type { StaffReservationResponse } from '@/types/reservation.type'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 font-bold',
  CONFIRMED: 'bg-blue-500/10 text-blue-600 font-bold',
  CHECKED_IN: 'bg-green-500/10 text-green-600 font-bold',
  COMPLETED: 'bg-slate-500/10 text-slate-600 font-bold',
  CANCELLED: 'bg-red-500/10 text-red-600 font-bold',
  NO_SHOW: 'bg-gray-500/10 text-gray-600 font-bold'
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'CHỜ XÁC NHẬN',
  CONFIRMED: 'ĐÃ XÁC NHẬN',
  CHECKED_IN: 'ĐÃ ĐẾN',
  COMPLETED: 'HOÀN THÀNH',
  CANCELLED: 'ĐÃ HUỶ',
  NO_SHOW: 'KHÔNG ĐẾN'
}

const ReservationList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['staff-reservations', statusFilter],
    queryFn: () => reservationApi.getAllReservations({ status: statusFilter || undefined, size: 100 }),
    select: (res) => res.data?.data?.data || []
  })

  const checkInMutation = useMutation({
    mutationFn: (reservationId: number) => reservationApi.checkInReservation(reservationId),
    onSuccess: () => {
      toast.success('Check in đặt bàn thành công')
      queryClient.invalidateQueries({ queryKey: ['staff-reservations'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể check in đặt bàn')
    }
  })

  // Tìm kiếm cục bộ theo mã hoặc tên
  const filteredReservations = (data || []).filter((r: StaffReservationResponse) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (r.code && r.code.toLowerCase().includes(searchLower)) ||
      (r.customerName && r.customerName.toLowerCase().includes(searchLower)) ||
      (r.phone && r.phone.includes(searchLower))
    )
  })

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string | number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (isLoading) return <div className="p-6 text-center">Đang tải danh sách đặt bàn...</div>

  return (
    <div className='bg-background text-foreground min-h-screen px-4 pt-10 pb-20 md:px-8'>
      {/* Header Page */}
      <div className='mx-auto mb-10 max-w-7xl text-center'>
        <p className='text-primary mb-2 text-sm font-bold tracking-widest uppercase'>• Reservation Management</p>
        <h1 className='text-foreground mb-4 text-4xl font-bold md:text-5xl'>Danh sách đặt bàn</h1>
        <p className='text-muted-foreground mx-auto max-w-2xl'>
          Quản lý danh sách đặt bàn và gọi món trước của khách hàng.
        </p>
      </div>

      <div className='mx-auto max-w-5xl'>
        {/* Top Bar / Filters */}
        <div className='mb-8 flex flex-wrap gap-4'>
          <div className='flex-1 min-w-[300px]'>
            <Input 
              className='bg-card border-border h-11 focus-visible:ring-primary focus-visible:ring-1 rounded-lg' 
              placeholder='Tìm theo tên, sđt hoặc mã đặt bàn...' 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex gap-4'>
            <select 
              className='bg-card border-border focus:border-primary h-11 cursor-pointer rounded-lg border px-3 text-sm outline-none'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value=''>Tất cả trạng thái</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <Button 
              variant='outline'
              className='h-11 bg-card hover:bg-accent hover:text-accent-foreground border-border rounded-lg px-6 font-medium transition-colors' 
              onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
            >
              Xóa lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Reservation Cards List */}
      <div className='space-y-6 mx-auto max-w-5xl'>
        {filteredReservations.length === 0 && (
          <div className="bg-card/50 border-border rounded-xl border border-dashed py-20 text-center">
            <p className="text-muted-foreground text-xl font-bold">Không tìm thấy đơn đặt bàn nào!</p>
          </div>
        )}
        {filteredReservations.map((reservation: StaffReservationResponse) => {
          const items = reservation.orderDetails?.filter((od: any) => od.item != null) || []
          const combos = reservation.orderDetails?.filter((od: any) => od.combo != null) || []
          const totalPreOrder = items.length + combos.length
          const isExpanded = expandedCards[reservation.id]
          const hasOrder = reservation.orderId != null

          const renderActionButton = () => {
            if (reservation.status === 'CONFIRMED') {
              return (
                <button
                  className='bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors'
                  onClick={() => checkInMutation.mutate(reservation.id)}
                  disabled={checkInMutation.isPending}
                >
                  Check in
                </button>
              )
            }

            if (reservation.status === 'CHECKED_IN' && hasOrder) {
              return (
                <button
                  className='bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors'
                  onClick={() => navigate('/staff/order-management', { state: { selectedOrderId: reservation.orderId } })}
                >
                  Xem món
                </button>
              )
            }

            if (reservation.status === 'CHECKED_IN' && !hasOrder) {
              return (
                <button
                  className='bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors'
                  onClick={() => navigate('/staff/order-management', { state: { reservationId: reservation.id, createFromReservation: true } })}
                >
                  Gọi món
                </button>
              )
            }

            return null
          }

          return (
            <div key={reservation.id} className='bg-card border-border hover:border-primary/50 relative flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md mb-6'>
              {/* Content Area */}
              <div className='flex flex-1 flex-col p-5'>
                <div className='mb-6 flex justify-between items-start'>
                  <div>
                    <h2 className='text-foreground text-xl font-bold mb-2'>{reservation.customerName}</h2>
                    <div className='mb-2'>
                      <span className={clsx('text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wide', STATUS_COLORS[reservation.status] || 'bg-slate-100 text-slate-700 font-bold')}>
                        {STATUS_LABELS[reservation.status] || reservation.status}
                      </span>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      #{reservation.code?.substring(0, 8).toUpperCase()} • {reservation.phone || 'N/A'}
                    </div>
                  </div>
                  {renderActionButton()}
                </div>

                {/* Info Grid */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Ngày & Giờ</p>
                    <p className='text-foreground text-sm font-medium'>
                      {reservation.date ? new Date(reservation.date).toLocaleDateString() : 'N/A'} {reservation.startTime?.substring(0, 5)}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Số khách</p>
                    <p className='text-foreground text-sm font-medium'>{reservation.guestNumber} khách</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Bàn</p>
                    <p className='text-foreground text-sm font-medium'>{reservation.tableName || 'Chưa xếp bàn'}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Liên hệ</p>
                    <p className='text-muted-foreground text-sm'>{reservation.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Note */}
                {reservation.note && (
                  <div className='bg-muted/50 rounded-lg p-3 mb-6'>
                    <p className='text-sm text-muted-foreground'>
                      <span className='font-semibold mr-1'>Ghi chú:</span> {reservation.note}
                    </p>
                  </div>
                )}

                {/* Pre-order Section */}
                {totalPreOrder > 0 && (
                  <div className='border-border rounded-lg border mt-2 overflow-hidden'>
                    {/* Accordion Header */}
                    <div 
                      className='bg-muted/30 p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors'
                      onClick={() => toggleExpand(reservation.id)}
                    >
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-sm text-foreground'>Món đặt trước</span>
                        {isExpanded ? <ChevronUp className='w-4 h-4 text-muted-foreground' /> : <ChevronDown className='w-4 h-4 text-muted-foreground' />}
                      </div>
                      <div className='text-xs text-muted-foreground hidden sm:block'>
                        Nhấn để xem chi tiết
                      </div>
                      <div>
                        <span className='bg-primary/10 text-primary text-xs font-bold px-2.5 py-1.5 rounded-full'>
                          {totalPreOrder} món
                        </span>
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className='p-5 bg-card border-t border-border space-y-6'>
                        {/* Món lẻ */}
                        {items.length > 0 && (
                          <div>
                            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4'>
                              Món lẻ
                            </h3>
                            <div className='space-y-3'>
                              {items.map((od: any) => (
                                <div key={od.id} className='flex justify-between items-center py-2 border-b border-border/50 last:border-0'>
                                  <span className='text-sm font-medium text-foreground'>{od.item?.name}</span>
                                  <span className='text-muted-foreground text-sm'>
                                    x{od.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Combo */}
                        {combos.length > 0 && (
                          <div>
                            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4'>
                              Combo / Set Menu
                            </h3>
                            <div className='space-y-3'>
                              {combos.map((od: any) => (
                                <div key={od.id} className='flex justify-between items-center py-2 border-b border-border/50 last:border-0'>
                                  <span className='text-sm font-medium text-foreground'>{od.combo?.name}</span>
                                  <span className='text-muted-foreground text-sm'>
                                    x{od.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReservationList

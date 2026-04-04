import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Check, X, User, Phone, Calendar, Clock, Users, Hash, FileText, ShoppingBag } from 'lucide-react'
import type { StaffReservationResponse } from '@/types/reservation.type'
import { formatCurrency } from '@/utils/utils'
import clsx from 'clsx'

interface ReservationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: StaffReservationResponse | null
  onCheckIn: (res: StaffReservationResponse) => void
  onCancel: (id: number) => void
  isMutating: boolean
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận bàn',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
  NO_SHOW: 'Không đến'
}

export default function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
  onCheckIn,
  onCancel,
  isMutating
}: ReservationDetailModalProps) {
  if (!reservation) return null

  const canCheckIn = reservation.status === 'CONFIRMED'
  const canCancel = ['PENDING', 'CONFIRMED'].includes(reservation.status)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Chi tiết đặt bàn' maxWidth='max-w-2xl'>
      <div className='space-y-8 py-2'>
        
        {/* Reservation Header Info */}
        <div className='flex justify-between items-start border-b border-slate-100 pb-6'>
           <div className='space-y-1'>
              <h3 className='text-2xl font-black text-[#003C71]'>#{reservation.code?.substring(0, 8).toUpperCase()}</h3>
              <div className='flex items-center gap-2'>
                 <div className={clsx(
                   'w-2 h-2 rounded-full ring-2 ring-offset-1',
                   reservation.status === 'PENDING' ? 'bg-yellow-500 ring-yellow-400/30' : 
                   reservation.status === 'CONFIRMED' ? 'bg-blue-500 ring-blue-400/30' :
                   reservation.status === 'CHECKED_IN' ? 'bg-emerald-500 ring-emerald-400/30' : 
                   reservation.status === 'CANCELLED' ? 'bg-red-500 ring-red-400/30' : 'bg-slate-400 ring-slate-300/30'
                 )}></div>
                 <span className='text-xs font-black text-slate-500 uppercase tracking-widest'>
                    {STATUS_LABELS[reservation.status] || reservation.status}
                 </span>
              </div>
           </div>
           
           <div className='text-right'>
              <div className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>Số khách</div>
              <div className='flex items-center justify-end gap-1 text-xl font-bold text-slate-700'>
                 <Users size={20} className='text-primary' /> {reservation.guestNumber}
              </div>
           </div>
        </div>

        {/* Info Grid */}
        <div className='grid grid-cols-2 gap-y-8 gap-x-12'>
           <div className='space-y-2'>
              <label className='flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                 <User size={12}/> Khách hàng
              </label>
              <p className='font-bold text-slate-800'>{reservation.customerName}</p>
           </div>
           
           <div className='space-y-2'>
              <label className='flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                 <Phone size={12}/> Số điện thoại
              </label>
              <p className='font-bold text-slate-800'>{reservation.phone || 'N/A'}</p>
           </div>

           <div className='space-y-2'>
              <label className='flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                 <Calendar size={12}/> Ngày đến
              </label>
              <p className='font-bold text-slate-800'>{reservation.date}</p>
           </div>

           <div className='space-y-2'>
              <label className='flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                 <Clock size={12}/> Thời gian
              </label>
              <p className='font-bold text-slate-800'>{reservation.startTime?.substring(0, 5)} - {reservation.endTime?.substring(0, 5)}</p>
           </div>

           <div className='space-y-2'>
              <label className='flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                 <Hash size={12}/> Bàn phục vụ
              </label>
              <p className='font-black text-primary'>{reservation.tableName || 'CHƯA XẾP BÀN'}</p>
           </div>

           <div className='space-y-2 col-span-2'>
              <label className='flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                 <FileText size={12}/> Ghi chú khách hàng
              </label>
              <p className='text-sm text-slate-600 bg-slate-50 p-3 rounded-lg min-h-[60px] italic border border-slate-100'>
                 {reservation.note || 'Không có ghi chú nào.'}
              </p>
           </div>
        </div>

        {/* Pre-ordered Items */}
        {reservation.orderDetails && reservation.orderDetails.length > 0 && (
           <div className='space-y-4 pt-4 border-t border-slate-100'>
              <h4 className='flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest'>
                 <ShoppingBag size={14} className='text-primary'/> Món ăn đặt trước
              </h4>
              <div className='bg-slate-50/50 rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden'>
                 {reservation.orderDetails.map((item: any, idx: number) => (
                    <div key={idx} className='p-4 flex justify-between items-center'>
                       <div className='flex items-center gap-3'>
                          <span className='w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500'>{item.quantity}x</span>
                          <span className='font-bold text-sm text-slate-700'>{item.name}</span>
                       </div>
                       <span className='font-black text-primary text-sm'>{formatCurrency(item.unitPrice)}</span>
                    </div>
                 ))}
                 <div className='p-4 bg-primary/5 flex justify-between items-center'>
                    <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>Tạm tính món ăn</span>
                    <span className='text-lg font-black text-primary'>
                       {formatCurrency(reservation.orderDetails.reduce((acc: number, i: any) => acc + (i.unitPrice * i.quantity), 0))}
                    </span>
                 </div>
              </div>
           </div>
        )}

        {/* Actions */}
        <div className='pt-6 flex gap-4'>
           {canCancel && (
              <Button 
                variant='outline' 
                onClick={() => onCancel(reservation.id)}
                disabled={isMutating}
                className='flex-1 h-12 rounded-xl text-red-500 border-red-200 hover:bg-red-50 font-bold uppercase tracking-widest text-xs gap-2'
              >
                 <X size={16} /> Huỷ đặt bàn
              </Button>
           )}
           {canCheckIn && (
              <Button 
                onClick={() => onCheckIn(reservation)}
                disabled={isMutating}
                className='flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 font-bold uppercase tracking-widest text-xs gap-2'
              >
                 <Check size={16} /> Check-in Nhận bàn
              </Button>
           )}
           {!canCheckIn && !canCancel && (
              <Button 
                onClick={onClose}
                className='w-full h-12 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold uppercase tracking-widest text-xs'
              >
                 Đóng
              </Button>
           )}
        </div>
      </div>
    </Modal>
  )
}

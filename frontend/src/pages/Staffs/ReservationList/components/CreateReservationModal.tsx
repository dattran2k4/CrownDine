import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Calendar, Users, Hash, Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import reservationApi from '@/apis/reservation.api'
import tableApi from '@/apis/table.api'
import { useMutation, useQuery } from '@tanstack/react-query'
import MenuSelector from '@/components/MenuSelector/MenuSelector'
import type { MenuCardItem } from '@/types/item.type'
import { formatCurrency, generateTimeSlots, isDateTimeInPast } from '@/utils/utils'

interface CreateReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CartItem {
  id: string | number
  type: 'item' | 'combo'
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export default function CreateReservationModal({ isOpen, onClose, onSuccess }: CreateReservationModalProps) {
  const [guestName, setGuestName] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  
  const [formData, setFormData] = useState(() => {
    const d = new Date().toISOString().split('T')[0]
    const allSlots = generateTimeSlots(9, 22, 30).filter((slot) => slot !== '22:00')
    const nextValidTime = allSlots.find((slot) => !isDateTimeInPast(d, slot))
    
    return {
      date: d,
      startTime: nextValidTime || '',
      guestNumber: 2,
      tableId: '',
      note: ''
    }
  })

  // --- Queries ---
  const { data: tableData } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getAllTables(),
    enabled: isOpen
  })
  const tables = tableData?.data?.data || []

  // --- Handlers ---
  const handleSelectItem = (item: MenuCardItem, type: 'item' | 'combo') => {
    setCart((prev) => {
      const exist = prev.find(i => i.id === item.id && i.type === type)
      if (exist) {
        return prev.map(i => i.id === item.id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, {
        id: item.id,
        type,
        name: item.name,
        price: Number(item.priceAfterDiscount ?? item.price),
        quantity: 1,
        imageUrl: item.imageUrl
      }]
    })
  }

  const updateQuantity = (id: string | number, type: 'item' | 'combo', delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id && i.type === type) {
        const newQ = Math.max(1, i.quantity + delta)
        return { ...i, quantity: newQ }
      }
      return i
    }))
  }

  const removeItem = (id: string | number, type: 'item' | 'combo') => {
    setCart(prev => prev.filter(i => !(i.id === id && i.type === type)))
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Create Reservation
      const res = await reservationApi.createWalkInReservationByStaff({
        ...formData,
        tableId: parseInt(formData.tableId),
        guestName: guestName.trim()
      })
      const reservationId = res.data.data.reservationId
      
      // 2. Add Items sequentially to ensure they are all added
      if (cart.length > 0) {
        for (const item of cart) {
          await reservationApi.addItemToReservation(reservationId, {
            itemId: item.type === 'item' ? Number(item.id) : undefined,
            comboId: item.type === 'combo' ? Number(item.id) : undefined,
            quantity: item.quantity
          })
        }
      }
      return res
    },
    onSuccess: () => {
      toast.success('Tạo đơn đặt bàn & đặt món thành công')
      onSuccess()
      handleClose()
    },
    onError: (err: any) => {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message))
    }
  })

  const handleClose = () => {
    onClose()
    setGuestName('')
    setCart([])
    const d = new Date().toISOString().split('T')[0]
    const allSlots = generateTimeSlots(9, 22, 30).filter((slot) => slot !== '22:00')
    const nextValidTime = allSlots.find((slot) => !isDateTimeInPast(d, slot))
    setFormData({
      date: d,
      startTime: nextValidTime || '',
      guestNumber: 2,
      tableId: '',
      note: ''
    })
  }

  const totalPrice = cart.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Tạo đặt bàn & Chọn món đặt trước' maxWidth='max-w-7xl'>
      <div className='flex flex-col lg:flex-row gap-8 min-h-[600px] max-h-[85vh]'>
        
        {/* Left Column: Guest & Reservation Info */}
        <div className='w-full lg:w-1/3 flex flex-col gap-6 border-r border-border pr-0 lg:pr-8 overflow-y-auto overflow-x-hidden scrollbar-hide'>
           <div className='space-y-4'>
              <h3 className='text-lg font-bold flex items-center gap-2'>
                <div className='bg-primary/10 p-2 rounded-lg'><User className='w-5 h-5 text-primary'/></div>
                Khách vãng lai
              </h3>

              <div className='space-y-1.5'>
                <label className='text-[10px] font-bold uppercase text-muted-foreground tracking-widest'>Tên khách</label>
                <Input
                  placeholder='Ví dụ: Nguyễn Văn A'
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className='h-11'
                />
              </div>
           </div>

           <div className='space-y-4'>
              <h3 className='text-lg font-bold flex items-center gap-2'>
                <div className='bg-primary/10 p-2 rounded-lg'><Calendar className='w-5 h-5 text-primary'/></div>
                Chi tiết đặt chỗ
              </h3>
              
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-bold uppercase text-muted-foreground tracking-widest'>Ngày đến</label>
                  <Input 
                    type='date' 
                    className='h-11' 
                    value={formData.date} 
                    onChange={e => {
                      const newDate = e.target.value
                      const allSlots = generateTimeSlots(9, 22, 30).filter((slot) => slot !== '22:00')
                      const nextValidTime = allSlots.find((slot) => !isDateTimeInPast(newDate, slot))
                      setFormData({ ...formData, date: newDate, startTime: nextValidTime || '' })
                    }} 
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-bold uppercase text-muted-foreground tracking-widest'>Giờ đến</label>
                  <Input type='time' className='h-11' value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-bold uppercase text-muted-foreground tracking-widest'>Số lượng khách</label>
                  <div className='relative'>
                    <Users className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input type='number' min={1} max={20} className='pl-9 h-11' value={formData.guestNumber} onChange={e => {
                      const val = parseInt(e.target.value) || 1
                      setFormData({ ...formData, guestNumber: Math.min(20, Math.max(1, val)) })
                    }} />
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-bold uppercase text-muted-foreground tracking-widest'>Bàn phục vụ</label>
                  <div className='relative'>
                    <Hash className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <select
                      className='w-full h-11 pl-9 rounded-md border border-input bg-card text-sm focus:ring-1 focus:ring-primary outline-none py-2'
                      value={formData.tableId}
                      onChange={e => setFormData({ ...formData, tableId: e.target.value })}
                    >
                      <option value=''>Chọn bàn</option>
                      {tables.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} (Sức chứa: {t.capacity})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-[10px] font-bold uppercase text-muted-foreground tracking-widest'>Ghi chú nội bộ</label>
                <Input placeholder='Yêu cầu đặc biệt...' className='h-11' value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
              </div>
           </div>

           {/* Summary Section */}
           <div className='mt-auto pt-6 border-t border-border flex flex-col gap-4 sticky bottom-0 bg-card'>
              <div className='flex justify-between items-center text-xl'>
                <span className='font-medium text-muted-foreground'>Tạm tính:</span>
                <span className='font-black text-primary'>{formatCurrency(totalPrice)}</span>
              </div>
              <Button 
                onClick={() => createMutation.mutate()} 
                disabled={!guestName.trim() || !formData.tableId || createMutation.isPending}
                className='w-full h-16 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest'
              >
                {createMutation.isPending ? 'Đang khởi tạo...' : 'XÁC NHẬN ĐẶT BÀN'}
              </Button>
           </div>
        </div>

        {/* Right Column: Menu Selection */}
        <div className='flex-1 flex flex-col gap-6 h-full overflow-hidden'>
           <div className='flex justify-between items-center'>
             <div>
               <h3 className='text-3xl font-black uppercase tracking-tighter'>Thực đơn đặt trước</h3>
               <p className='text-xs text-muted-foreground tracking-wide font-medium'>Khách có thể đặt món trước để nhà hàng chuẩn bị sớm hơn.</p>
             </div>
             <div className='bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider'>
                {cart.length} món dự kiến
             </div>
           </div>

           <div className='flex flex-1 gap-6 overflow-hidden'>
              {/* Menu List */}
              <div className='flex-1 h-full overflow-hidden bg-muted/20 border border-border rounded-[2rem] p-5 shadow-inner'>
                 <MenuSelector onSelectItem={handleSelectItem} />
              </div>

              {/* Advanced Cart */}
              <div className='w-80 bg-card border border-border rounded-[2rem] flex flex-col overflow-hidden shadow-2xl'>
                 <div className='p-6 border-b border-border bg-muted/10 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                       <Users className='w-4 h-4 text-primary' />
                       <span className='font-black text-xs uppercase tracking-widest'>Giỏ hàng</span>
                    </div>
                    {cart.length > 0 && (
                      <button onClick={() => setCart([])} className='text-[10px] text-red-500 font-bold uppercase hover:underline'>Dọn sạch</button>
                    )}
                 </div>
                 
                 <div className='flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin'>
                    {cart.length === 0 ? (
                      <div className='h-full flex flex-col items-center justify-center text-center p-6 opacity-30 gap-4'>
                         <div className='w-16 h-16 rounded-full border-4 border-dashed border-muted-foreground flex items-center justify-center'>
                            <Plus className='w-8 h-8 text-muted-foreground' />
                         </div>
                         <p className='text-xs font-bold uppercase tracking-wide'>Vui lòng thêm món<br/>từ thực đơn</p>
                      </div>
                    ) : cart.map(item => (
                      <div key={`${item.type}-${item.id}`} className='group animate-in slide-in-from-right-2 fade-in'>
                         <div className='flex justify-between items-start mb-2'>
                            <span className='text-sm font-bold line-clamp-2 flex-1 leading-tight group-hover:text-primary transition-colors'>{item.name}</span>
                            <button onClick={() => removeItem(item.id, item.type)} className='ml-2 opacity-50 hover:opacity-100 hover:text-red-500 transition-all'>
                               <Trash2 className='w-3.5 h-3.5' />
                            </button>
                         </div>
                         <div className='flex justify-between items-center'>
                            <span className='text-sm text-primary font-black'>{formatCurrency(item.price)}</span>
                            <div className='flex items-center gap-3 bg-muted rounded-full px-3 py-1.5 shadow-sm'>
                               <button onClick={() => updateQuantity(item.id, item.type, -1)} className='hover:text-primary active:scale-75 transition-transform'><Minus className='w-3 h-3'/></button>
                               <span className='text-xs w-4 text-center font-black'>{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.id, item.type, 1)} className='hover:text-primary active:scale-75 transition-transform'><Plus className='w-3 h-3'/></button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {cart.length > 0 && (
                   <div className='p-6 bg-primary/5 border-t border-border'>
                      <p className='text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1'>Thành tiền món</p>
                      <p className='text-2xl font-black text-primary'>{formatCurrency(totalPrice)}</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </Modal>
  )
}

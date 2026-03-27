import { useState, useMemo } from 'react'
import { Search, LayoutGrid, ChevronLeft, ChevronRight, UtensilsCrossed, Users, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation } from '@tanstack/react-query'
import tableApi from '@/apis/table.api'
import orderApi from '@/apis/order.api'
import OrderDrawer from './OrderManagement/components/OrderDrawer'
import PaymentModal from './OrderManagement/components/PaymentModal'
import { CancelModal } from './OrderManagement/components/CancelModal'
import { queryClient } from '@/main'
import { toast } from 'sonner'
import { useSubscription } from 'react-stomp-hooks'
import type { Order } from '@/types/order.type'

const Cashier = () => {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [activeFilter, setActiveFilter] = useState('Tất cả')

  // UI States for Modals/Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)
  const [cancelingOrder, setCancelingOrder] = useState<Order | null>(null)
  const [preSelectedTableId, setPreSelectedTableId] = useState<number | null>(null)

  // Fetch Tables
  const { data: tableData, isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getAllTables(),
    refetchInterval: 2500
  })

  // Fetch Active Orders (all to ensure matching regardless of specific served status)
  const { data: orderData } = useQuery({
    queryKey: ['orders-active'],
    queryFn: () => orderApi.getAllOrders({}),
    refetchInterval: 5000,
    select: (response) => {
      const all = response?.data?.data?.data ?? []
      return all.filter(
        (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'PRE_ORDER'
      )
    }
  })

  // WebSocket Subscriptions for Real-time
  useSubscription('/topic/tables', () => {
    queryClient.invalidateQueries({ queryKey: ['tables'] })
  })

  useSubscription('/topic/orders', () => {
    queryClient.invalidateQueries({ queryKey: ['orders-active'] })
    queryClient.invalidateQueries({ queryKey: ['tables'] })
  })

  const rawTables = tableData?.data.data || []
  const activeOrders = orderData || []

  const tabs = ['Tất cả', 'Lầu 2', 'Lầu 3', 'Phòng VIP']

  // Table Stats
  const stats = useMemo(() => {
    const total = rawTables.length
    const using = rawTables.filter((t: any) => t.status === 'OCCUPIED').length
    const empty = rawTables.filter((t: any) => t.status === 'AVAILABLE').length
    return { total, using, empty }
  }, [rawTables])

  const filters = [
    { label: 'Tất cả', icon: LayoutGrid, count: stats.total, color: 'text-primary' },
    { label: 'Sử dụng', icon: Users, count: stats.using, color: 'text-orange-600' },
    { label: 'Còn trống', icon: CheckCircle2, count: stats.empty, color: 'text-emerald-600' }
  ]

  // Filter logic
  const filteredTables = rawTables.filter((table: any) => {
    if (activeTab === 'Lầu 2' && !table.name.includes('L2')) return false
    if (activeTab === 'Lầu 3' && !table.name.includes('L3')) return false
    if (activeTab === 'Phòng VIP' && !table.name.includes('VIP')) return false

    if (activeFilter === 'Sử dụng' && table.status !== 'OCCUPIED') return false
    if (activeFilter === 'Còn trống' && table.status !== 'AVAILABLE') return false

    return true
  })

  const getTableOrder = (tableName: string) => {
    return activeOrders.find((o) => o.tableName === tableName)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const handleTableClick = (table: any) => {
    const order = getTableOrder(table.name)
    if (order) {
      setSelectedOrder(order)
      setPreSelectedTableId(null)
      setIsDrawerOpen(true)
    } else {
      // For empty table, opening drawer to create a new order
      setSelectedOrder(null)
      setPreSelectedTableId(table.id)
      setIsDrawerOpen(true)
    }
  }

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => orderApi.updateOrderStatus(orderId, 'CANCELLED'),
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['orders-active'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      setCancelingOrder(null)
    },
    onError: (err: any) => {
      toast.error('Lỗi khi hủy đơn hàng: ' + err.message)
    }
  })

  if (isLoadingTables)
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='animate-pulse font-bold text-primary'>Đang tải dữ liệu bàn...</p>
        </div>
      </div>
    )

  return (
    <div className='animate-fade-in flex min-h-[calc(100vh-160px)] flex-col gap-8'>
      {/* Top Header & Navigation */}
      <div className='bg-card/50 sticky top-0 z-10 -mx-4 flex flex-col gap-6 px-4 pb-4 pt-2 backdrop-blur-md lg:mx-0 lg:px-0'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-3xl font-black tracking-tighter text-slate-900'>QUẢN LÝ BÀN</h1>
            <p className='text-muted-foreground text-sm font-medium'>Sơ đồ bàn thời gian thực • {stats.using} bàn đang phục vụ</p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline' size='icon' className='h-12 w-12 rounded-2xl bg-white shadow-soft transition-all hover:scale-105 active:scale-95'>
              <Search className='h-5 w-5' />
            </Button>
            <Button variant='outline' size='icon' className='h-12 w-12 rounded-2xl bg-white shadow-soft transition-all hover:scale-105 active:scale-95'>
              <LayoutGrid className='h-5 w-5 text-primary' />
            </Button>
          </div>
        </div>

        <div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide'>
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant='ghost'
              className={cn(
                'relative h-11 px-8 font-bold transition-all duration-300 rounded-xl',
                activeTab === tab 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-1 ring-primary/20 scale-105' 
                  : 'bg-white/50 text-slate-600 hover:bg-white hover:text-primary'
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex flex-col gap-8 lg:flex-row'>
        {/* Left Side: Stats & Filters */}
        <div className='flex flex-shrink-0 flex-col gap-4 lg:w-64'>
          <div className='flex flex-col gap-3 rounded-3xl bg-white/40 p-4 ring-1 ring-slate-100 shadow-sm'>
            <p className='px-2 text-xs font-black tracking-widest text-slate-400 uppercase'>Bộ lọc trạng thái</p>
            {filters.map((filter) => (
              <button
                key={filter.label}
                className={cn(
                  'flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300',
                  activeFilter === filter.label
                    ? 'bg-white shadow-md ring-1 ring-slate-100'
                    : 'hover:bg-white/60 text-slate-500'
                )}
                onClick={() => setActiveFilter(filter.label)}
              >
                <div className='flex items-center gap-3'>
                  <div className={cn('h-2.5 w-2.5 rounded-full ring-4 ring-offset-2', 
                    activeFilter === filter.label ? 'bg-primary ring-primary/20' : 'bg-slate-300 ring-transparent'
                  )} />
                  <span className={cn('text-sm font-bold', activeFilter === filter.label && 'text-slate-900')}>{filter.label}</span>
                </div>
                <span className={cn('rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black', filter.color)}>{filter.count}</span>
              </button>
            ))}
          </div>

          <div className='rounded-3xl bg-gradient-to-br from-primary/10 to-orange-500/5 p-6 shadow-sm border border-primary/10'>
             <div className='flex items-center gap-2 mb-3'>
                <div className='h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white'>
                   <Clock className='h-4 w-4' />
                </div>
                <span className='font-bold text-slate-800 text-sm'>Hoạt động vừa qua</span>
             </div>
             <p className='text-xs text-slate-500 leading-relaxed font-medium'>Toàn bộ bàn được cập nhật tự động mỗi khi có thay đổi từ bếp hoặc nhân viên.</p>
          </div>
        </div>

        {/* Right Side: Table Grid */}
        <div className='flex-1'>
          <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
            {filteredTables.map((table: any) => {
              const isOccupied = table.status === 'OCCUPIED'
              const order = isOccupied ? getTableOrder(table.name) : null
              const itemCount = order?.orderDetails?.reduce((acc: number, d: any) => acc + d.quantity, 0) || 0

              return (
                <div 
                  key={table.id} 
                  className='group animate-in fade-in slide-in-from-bottom-3 duration-500'
                  onClick={() => handleTableClick(table)}
                >
                  <div
                    className={cn(
                      'relative flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-[2rem] transition-all duration-500 hover:-translate-y-2',
                      isOccupied
                        ? 'bg-primary text-white shadow-2xl shadow-primary/40 ring-4 ring-primary/20 active:scale-95'
                        : 'border border-slate-200 bg-white hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 active:scale-95'
                    )}
                  >
                    <div className='relative flex flex-col items-center'>
                      {/* Detailed Table Icon */}
                      <div className='flex gap-5 mb-1'>
                        <div className={cn('h-2 w-7 rounded-t-full transition-all', isOccupied ? 'bg-white/40' : 'bg-slate-100')} />
                        <div className={cn('h-2 w-7 rounded-t-full transition-all', isOccupied ? 'bg-white/40' : 'bg-slate-100')} />
                      </div>

                      <div
                        className={cn(
                          'relative h-20 w-32 rounded-[1.5rem] border-2 shadow-inner flex items-center justify-center p-3 z-10 transition-all duration-500',
                          isOccupied ? 'border-white/50 bg-white/15' : 'border-slate-100 bg-slate-50/50'
                        )}
                      >
                        {isOccupied && order ? (
                          <div className='flex w-full flex-col gap-2'>
                            <div className='flex justify-between items-start'>
                                <span className='text-[10px] font-black uppercase opacity-80'>Tiền:</span>
                                <div className='flex items-center gap-1 text-[10px] font-bold bg-white/20 rounded-lg px-2 py-0.5'>
                                   <Clock className='h-3 w-3' />
                                   {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)}p
                                </div>
                            </div>
                            <span className='text-sm sm:text-lg font-black leading-none drop-shadow-sm'>{formatCurrency(order.finalPrice).replace('₫', '')}</span>
                            <div className='flex items-center gap-3 pt-1 border-t border-white/20'>
                              <div className='flex items-center gap-1'>
                                <UtensilsCrossed className='h-3 w-3' />
                                <span className='text-xs font-bold leading-none'>{itemCount}</span>
                              </div>
                              <div className='flex items-center gap-1 border-l border-white/20 pl-3'>
                                <Users className='h-3 w-3' />
                                <span className='text-xs font-bold leading-none'>{table.capacity}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='h-full w-full rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center'>
                             <span className={cn('text-[10px] font-black tracking-widest uppercase', isOccupied ? 'text-white/40' : 'text-slate-300')}>Phòng: {table.capacity}</span>
                          </div>
                        )}
                      </div>

                      <div className='flex gap-5 mt-1'>
                        <div className={cn('h-2 w-7 rounded-b-full transition-all', isOccupied ? 'bg-white/40' : 'bg-slate-100')} />
                        <div className={cn('h-2 w-7 rounded-b-full transition-all', isOccupied ? 'bg-white/40' : 'bg-slate-100')} />
                      </div>
                    </div>

                    <div className='absolute bottom-4 flex flex-col items-center gap-1'>
                       <span className={cn('text-sm font-black tracking-tight uppercase', isOccupied ? 'text-white' : 'text-slate-800')}>
                        {table.name}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modern Footer Navigation */}
      <div className='bg-card/40 sticky bottom-4 z-10 flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border border-white/40 px-8 py-5 backdrop-blur-xl shadow-2xl sm:flex-row'>
        <div className='flex-1 hidden sm:block'>
           <p className='text-xs font-black text-slate-400 uppercase tracking-widest'>Navigation</p>
        </div>

        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' className='h-12 w-12 rounded-2xl border border-slate-100 bg-white/50 shadow-soft' disabled>
            <ChevronLeft className='h-5 w-5 text-slate-400' />
          </Button>
          <div className='flex h-12 min-w-[5rem] items-center justify-center rounded-2xl bg-white/80 px-4 text-sm font-black tracking-widest ring-1 ring-slate-100 shadow-sm'>
            <span className='text-primary'>01</span>
            <span className='mx-2 text-slate-300'>/</span>
            <span className='text-slate-500'>02</span>
          </div>
          <Button variant='ghost' size='icon' className='h-12 w-12 rounded-2xl border border-slate-100 bg-white/50 shadow-soft'>
            <ChevronRight className='h-5 w-5 text-slate-700' />
          </Button>
        </div>
      </div>

      {/* Drawer & Modals */}
      <OrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setPreSelectedTableId(null)
        }}
        order={selectedOrder}
        preSelectedTableId={preSelectedTableId}
        onPaymentClick={(order: Order) => {
          setIsDrawerOpen(false)
          setPaymentOrder(order)
        }}
        onCancelClick={(order: Order) => {
          setIsDrawerOpen(false)
          setCancelingOrder(order)
        }}
      />

      <PaymentModal
        isOpen={!!paymentOrder}
        onClose={() => setPaymentOrder(null)}
        order={paymentOrder}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['orders-active'] })
          queryClient.invalidateQueries({ queryKey: ['tables'] })
        }}
      />

      {cancelingOrder && (
        <CancelModal
          orderCode={cancelingOrder.code}
          isPending={cancelOrderMutation.isPending}
          onClose={() => setCancelingOrder(null)}
          onConfirm={() => cancelOrderMutation.mutate(cancelingOrder.id)}
        />
      )}
    </div>
  )
}

export default Cashier

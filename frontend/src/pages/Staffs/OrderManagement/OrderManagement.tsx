import orderApi from '@/apis/order.api'
import tableApi from '@/apis/table.api'
import { queryClient } from '@/main'
import OrderStatusSelect from '@/pages/Staffs/OrderManagement/components/OrderStatusSelect/OrderStatusSelect'
import type { Order } from '@/types/order.type'
import type { ETableShape, ETableStatus, Table } from '@/types/table.type'
import { useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useStompClient, useSubscription } from 'react-stomp-hooks'
import { toast } from 'sonner'

// --- Constants & Styles ---
const STATUS_CONFIG: Record<ETableStatus, { label: string; color: string }> = {
  AVAILABLE: { label: 'Trống', color: 'bg-[#00ff00]' }, // --online
  RESERVED: { label: 'Đã đặt', color: 'bg-[#f5a623]' }, // --warning
  OCCUPIED: { label: 'Đang dùng', color: 'bg-[#ff6b35]' }, // --primary
  UNAVAILABLE: { label: 'Hỏng/Bận', color: 'bg-[#b3b3b3]' } // --offline
}

const SHAPE_STYLES: Record<ETableShape, string> = {
  RECT: 'rounded-lg w-32 h-24',
  SQUARE: 'rounded-md w-24 h-24',
  CIRCLE: 'rounded-full w-24 h-24'
}

const OrderManagement = () => {
  const stompClient = useStompClient()

  const { data: orderData } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getAllOrders({})
  })

  const orders = orderData?.data.data.data || []

  // 1. Fetch dữ liệu ban đầu bằng React Query
  const { data: tableData, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getAllTables()
  })

  const tables = tableData?.data.data || []

  // 3. Hàm giả lập Staff cập nhật trạng thái
  const updateStatus = (tableId: string, newStatus: ETableStatus) => {
    if (stompClient) {
      stompClient.publish({
        destination: `/app/table/${tableId}`,
        body: JSON.stringify(newStatus)
      })
    } else {
      toast.error('Chưa kết nối được máy chủ WebSocket')
    }
  }

  // 2. Lắng nghe Real-time cập nhật từ WebSocket
  useSubscription('/topic/tables', (message) => {
    const updatedTable = JSON.parse(message.body) as Table

    // Cập nhật Cache mà không cần gọi lại API
    queryClient.setQueryData(['tables'], (oldData: AxiosResponse) => {
      if (!oldData) return oldData

      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: oldData.data.data.map((t: Table) => (t.id === updatedTable.id ? updatedTable : t))
        }
      }
    })

    toast.info(`Bàn ${updatedTable.name} vừa thay đổi trạng thái!`)
  })

  const stats = useMemo(() => {
    const defaultStatus = { TOTAL: 0, PRE_ORDER: 0, CONFIRMED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 }
    return orders.reduce((acc, order) => {
      acc.TOTAL++
      if (acc[order.status] !== undefined) acc[order.status]++
      return acc
    }, defaultStatus)
  }, [orders])

  // 2. Lắng nghe Real-time cập nhật từ WebSocket
  useSubscription('/topic/orders', (message) => {
    console.log('WS message received')
    const updatedOrder = JSON.parse(message.body) as Order

    queryClient.setQueryData(['orders'], (oldData: AxiosResponse) => {
      if (!oldData) return oldData

      return {
        ...oldData, // Tầng 1: AxiosResponse
        data: {
          ...oldData.data, //ApiResponse (success, message, data)
          data: {
            ...oldData.data.data, //PageResponse (data, ....)
            data: oldData.data.data.data.map((t: Order) => (t.id === updatedOrder.id ? { ...t, ...updatedOrder } : t))
          }
        }
      }
    })
    toast.success(`Đơn hàng #${updatedOrder.id} đã cập nhật real-time!`)
  })

  if (isLoading) return <div className='p-10 text-center'>Đang tải sơ đồ nhà hàng...</div>

  return (
    <div className='bg-background min-h-screen p-8 font-sans'>
      <header className='mb-10 flex items-center justify-between'>
        <div>
          <h1 className='text-foreground text-3xl font-bold tracking-tight italic'>Restaurant Floor Plan</h1>
          <p className='text-muted-foreground'>Theo dõi và cập nhật trạng thái bàn thời gian thực</p>
        </div>
        <div className='flex gap-4'>
          {Object.entries(STATUS_CONFIG).map(([key, value]) => (
            <div key={key} className='flex items-center gap-2 text-sm'>
              <span className={clsx('h-3 w-3 rounded-full', value.color)}></span>
              <span>{value.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Danh sách bàn */}
      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {tables.map((table) => (
          <div
            key={table.id}
            className='btn-restaurant glass group relative flex flex-col items-center justify-center p-6'
          >
            {/* Hình dáng bàn */}
            <div
              className={clsx(
                'smooth-transition mb-4 flex items-center justify-center border-2 border-black/5 shadow-inner',
                SHAPE_STYLES[table.shape],
                STATUS_CONFIG[table.status].color
              )}
            >
              <span className='text-xl font-black text-white drop-shadow-md'>{table.name}</span>
            </div>

            {/* Thông tin bàn */}
            <div className='text-center'>
              <p className='text-secondary font-bold italic'>Sức chứa: {table.capacity} người</p>
              <p className='text-muted-foreground text-xs tracking-widest uppercase'>
                {STATUS_CONFIG[table.status].label}
              </p>
            </div>

            {/* Action Buttons */}
            <div className='smooth-transition mt-4 flex flex-wrap justify-center gap-2 opacity-0 group-hover:opacity-100'>
              {(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'UNAVAILABLE'] as ETableStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(table.id, s)}
                  className={clsx(
                    'h-8 w-8 rounded-full border border-black/10 transition-all hover:scale-110 active:scale-95',
                    STATUS_CONFIG[s].color
                  )}
                  title={STATUS_CONFIG[s].label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- 4 Thẻ thống kê chuẩn màu dự án --- */}
      <div className='mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5'>
        <StatBox title='Tất cả' count={stats.TOTAL} color='bg-white' isMain />
        <StatBox title='Đặt trước' count={stats.PRE_ORDER} color='bg-[#f5a623]' />
        <StatBox title='Đã xác nhận' count={stats.CONFIRMED} color='bg-secondary' isDark />
        <StatBox title='Đang phục vụ' count={stats.IN_PROGRESS} color='bg-primary' />
        <StatBox title='Hoàn tất' count={stats.COMPLETED} color='bg-[#00ff00]' />
        <StatBox title='Huỷ' count={stats.CANCELLED} color='bg-red-500' />
      </div>

      {/* --- Danh sách Đơn hàng --- */}
      <div className='glass border-secondary border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead className='bg-secondary text-white'>
              <tr className='text-xs font-bold tracking-widest uppercase'>
                <th className='p-4'>Code</th>
                <th className='p-4'>Khách hàng</th>
                <th className='p-4'>Chi tiết món ({'Qty'})</th>
                <th className='p-4'>Tổng tiền</th>
                <th className='p-4'>Trạng thái</th>
              </tr>
            </thead>
            <tbody className='divide-border divide-y bg-white'>
              {orders.map((order) => (
                <tr key={order.id} className='hover:bg-primary/5 group transition-colors'>
                  <td className='text-secondary p-4 font-black'>#{order.code}</td>
                  <td className='p-4'>
                    <div className='font-bold'>{order.guestName}</div>
                    <div className='text-muted-foreground text-[10px] italic'>
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className='p-4'>
                    <div className='flex flex-wrap gap-1'>
                      {order.orderDetails.map((detail) => (
                        <span
                          key={detail.id}
                          className='border-secondary bg-background border px-1 text-[10px] font-medium'
                          title={detail.note}
                        >
                          {detail.quantity}x {detail.item?.name || 'Món ăn'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='text-primary p-4 font-bold'>{order.totalPrice.toLocaleString()}đ</td>
                  <td className='p-4'>
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// --- Sub-component: StatBox ---
function StatBox({ title, count, color, isDark, isMain }: any) {
  return (
    <div
      className={clsx(
        'border-secondary border-2 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1',
        color,
        isDark ? 'text-white' : 'text-secondary'
      )}
    >
      <p className='mb-2 text-[10px] font-black tracking-widest uppercase opacity-80'>{title}</p>
      <p className='text-3xl font-black italic'>{count}</p>
    </div>
  )
}

export default OrderManagement

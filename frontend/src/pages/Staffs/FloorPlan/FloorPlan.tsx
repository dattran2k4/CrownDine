import tableApi from '@/apis/table.api'
import { queryClient } from '@/main'
import type { Order } from '@/types/order.type'
import type { ETableShape, ETableStatus, Table } from '@/types/table.type'
import { useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useStompClient, useSubscription } from 'react-stomp-hooks'
import { toast } from 'sonner'

// --- Constants & Styles ---
const STATUS_CONFIG: Record<ETableStatus, { label: string; color: string; dot: string; textStatus: string }> = {
  AVAILABLE: { label: 'Trống', color: 'bg-[#02B875]', dot: 'bg-[#02B875]', textStatus: 'text-[#02B875]' },
  RESERVED: { label: 'Đã đặt', color: 'bg-[#F5A623]', dot: 'bg-[#F5A623]', textStatus: 'text-[#F5A623]' },
  OCCUPIED: { label: 'Đang dùng', color: 'bg-[#FF7300]', dot: 'bg-[#FF7300]', textStatus: 'text-[#FF7300]' },
  UNAVAILABLE: { label: 'Hỏng/Bận', color: 'bg-[#6B7280]', dot: 'bg-[#6B7280]', textStatus: 'text-[#6B7280]' }
}

const SHAPE_STYLES: Record<ETableShape, string> = {
  RECT: 'rounded-full w-32 h-32',
  SQUARE: 'rounded-full w-32 h-32',
  CIRCLE: 'rounded-full w-32 h-32'
}

// Function sinh Badge ngẫu nhiên dựa trên tên bàn (theo Mockup)
const getTableBadge = (name: string) => {
  if (name.includes('VIP')) return 'VIP'
  if (name.includes('T2')) return 'Premium'
  return 'Thường'
}

const FloorPlan = () => {
  const stompClient = useStompClient()

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

  // 2. Lắng nghe Real-time cập nhật từ WebSocket
  useSubscription('/topic/orders', (message) => {
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

  // Tính toán số lượng bàn theo từng trạng thái
  const tableStats = useMemo(() => {
    const stats: Record<ETableStatus, number> = {
      AVAILABLE: 0,
      RESERVED: 0,
      OCCUPIED: 0,
      UNAVAILABLE: 0
    }
    tables.forEach((t: Table) => {
      stats[t.status]++
    })
    return stats
  }, [tables])

  if (isLoading) return <div className='p-10 text-center'>Đang tải trạng thái bàn...</div>

  return (
    <div className='min-h-screen bg-[#F8FBFF] p-8 font-sans text-slate-800 lg:p-12'>
      <header className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold tracking-tight text-slate-900'>Trạng thái bàn nhà hàng</h1>
        <p className='text-sm font-medium text-slate-500'>Theo dõi và cập nhật trạng thái bàn thời gian thực</p>
      </header>

      {/* Row Thống kê (Stat Boxes) */}
      <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
        <StatBox
          title={STATUS_CONFIG.AVAILABLE.label}
          count={tableStats.AVAILABLE}
          dotColor={STATUS_CONFIG.AVAILABLE.dot}
        />
        <StatBox
          title={STATUS_CONFIG.RESERVED.label}
          count={tableStats.RESERVED}
          dotColor={STATUS_CONFIG.RESERVED.dot}
        />
        <StatBox
          title={STATUS_CONFIG.OCCUPIED.label}
          count={tableStats.OCCUPIED}
          dotColor={STATUS_CONFIG.OCCUPIED.dot}
        />
        <StatBox
          title={STATUS_CONFIG.UNAVAILABLE.label}
          count={tableStats.UNAVAILABLE}
          dotColor={STATUS_CONFIG.UNAVAILABLE.dot}
        />
      </div>

      {/* Legend & Filter Bar */}
      <div className='mb-10 flex flex-wrap items-center gap-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm'>
        {Object.entries(STATUS_CONFIG).map(([key, value]) => (
          <div key={key} className='flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80'>
            <span className={clsx('h-2.5 w-2.5 rounded-full', value.dot)}></span>
            <span className='text-sm font-bold text-slate-700'>{value.label}</span>
          </div>
        ))}
      </div>

      {/* Danh sách bàn */}
      <div className='rounded-xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12'>
        <div className='grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {tables.map((table) => (
            <div key={table.id} className='group relative flex flex-col items-center justify-start text-center'>
              {/* Hình dáng bàn */}
              <div
                className={clsx(
                  'mb-4 flex cursor-pointer flex-col items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95',
                  SHAPE_STYLES[table.shape],
                  STATUS_CONFIG[table.status].color
                )}
                onClick={() => {
                  // Giả lập Staff nhấn đổi trạng thái ngẫu nhiên (hoặc mở menu)
                  const statuses: ETableStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'UNAVAILABLE']
                  const nextStatus = statuses[(statuses.indexOf(table.status) + 1) % statuses.length]
                  updateStatus(table.id, nextStatus)
                }}
              >
                <span className='text-[22px] leading-tight font-black text-white'>{table.name}</span>
                <span className='mt-1 text-xs font-semibold text-white/90'>{STATUS_CONFIG[table.status].label}</span>
              </div>

              {/* Thông tin bàn */}
              <p className='mb-2 text-[15px] font-bold text-slate-900'>Sức chứa: {table.capacity} người</p>

              {/* Badge */}
              <div className='rounded-full border border-slate-300 bg-white px-4 py-1.5 shadow-sm'>
                <span className='text-[11px] leading-none font-bold tracking-widest text-slate-500 uppercase'>
                  {getTableBadge(table.name)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Sub-component: StatBox ---
function StatBox({ title, count, dotColor }: { title: string; count: number; dotColor: string }) {
  return (
    <div className='flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-sm font-bold text-slate-500'>{title}</span>
        <span className={clsx('h-3 w-3 rounded-full', dotColor)}></span>
      </div>
      <p className='text-[34px] leading-none font-extrabold text-slate-900'>{count}</p>
    </div>
  )
}

export default FloorPlan

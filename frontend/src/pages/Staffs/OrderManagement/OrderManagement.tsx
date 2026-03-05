import tableApi from '@/apis/table.api'
import type { ETableShape, ETableStatus, Table } from '@/types/table.type'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
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
  const [tables, setTables] = useState<Table[]>([])

  // 1. Fetch dữ liệu ban đầu bằng React Query
  const { data: initialData, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getAllTables()
  })

  // Cập nhật state khi có dữ liệu ban đầu
  useEffect(() => {
    if (initialData?.data?.data) {
      setTables(initialData.data.data)
    }
  }, [initialData])

  // 2. Lắng nghe Real-time cập nhật từ WebSocket
  useSubscription('/topic/tables', (message) => {
    const updatedTable = JSON.parse(message.body) as Table

    setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)))

    toast.info(`Bàn ${updatedTable.name} vừa thay đổi trạng thái!`)
  })

  // 3. Hàm giả lập Staff cập nhật trạng thái
  const updateStatus = (tableId: string, newStatus: ETableStatus) => {
    if (stompClient) {
      stompClient.publish({
        destination: `/app/table/${tableId}`,
        body: JSON.stringify(newStatus) // Gửi Enum trực tiếp theo Backend mong đợi
      })
    } else {
      toast.error('Chưa kết nối được máy chủ WebSocket')
    }
  }

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

            {/* Menu cập nhật nhanh (Action Buttons) */}
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
    </div>
  )
}

export default OrderManagement

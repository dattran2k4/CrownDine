import orderApi from '@/apis/order.api'
import { queryClient } from '@/main'
import type { Order, OrderDetailStatus } from '@/types/order.type'
import { useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useStompClient, useSubscription } from 'react-stomp-hooks'
import { toast } from 'sonner'

// ──────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────
const URGENT_MINUTES = 15
const OVERDUE_MINUTES = 20

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────
function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatClock(now: Date): string {
  return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ──────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────
function DetailStatusBadge({ status }: { status: OrderDetailStatus }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className='inline-flex items-center rounded-md bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-800 ring-1 ring-inset ring-yellow-300'>
          CHỜ
        </span>
      )
    case 'COOKING':
      return (
        <span className='inline-flex items-center rounded-md bg-gray-900 px-2.5 py-1 text-xs font-bold text-white'>
          ĐANG NẤU
        </span>
      )
    case 'SERVED':
      return (
        <span className='inline-flex items-center rounded-md bg-green-500 px-2.5 py-1 text-xs font-bold text-white'>
          SẴN SÀNG
        </span>
      )
    case 'CANCELLED':
      return (
        <span className='inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-300'>
          HỦY
        </span>
      )
    default:
      return null
  }
}

// ──────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────
const KitchenDisplay = () => {
  const [clock, setClock] = useState(new Date())
  const [, forceUpdate] = useState(0)
  const stompClient = useStompClient()
  const prevOrderCount = useRef(0)

  // Live clock
  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date())
      forceUpdate((n) => n + 1) // re-render for elapsed timers
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Fetch active kitchen orders
  const { data: orders = [] } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: () => orderApi.getKitchenOrders(),
    select: (res) => res?.data?.data ?? [],
    refetchInterval: 30000
  })

  // WebSocket — new order-details arrive
  useSubscription('/topic/order-details', (message) => {
    const updated = JSON.parse(message.body)

    queryClient.setQueryData(['kitchen-orders'], (old: AxiosResponse) => {
      if (!old) return old
      const orders: Order[] = old.data?.data ?? []
      const newOrders = orders.map((order) => ({
        ...order,
        orderDetails: order.orderDetails.map((d) => (d.id === updated.id ? { ...d, status: updated.status } : d))
      }))
      return { ...old, data: { ...old.data, data: newOrders } }
    })

    if (updated.status === 'PENDING') {
      toast.info('🍽️ Có món mới vừa được gửi đến bếp!')
      // Web Audio beep
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        osc.start()
        osc.stop(ctx.currentTime + 0.5)
      } catch {
        // ignore AudioContext errors
      }
    }
  })

  // WebSocket — order status changed (completed/cancelled → remove card)
  useSubscription('/topic/orders', (message) => {
    const updatedOrder = JSON.parse(message.body)
    if (updatedOrder.status === 'COMPLETED' || updatedOrder.status === 'CANCELLED') {
      queryClient.setQueryData(['kitchen-orders'], (old: AxiosResponse) => {
        if (!old) return old
        const orders: Order[] = old.data?.data ?? []
        return { ...old, data: { ...old.data, data: orders.filter((o) => o.id !== updatedOrder.id) } }
      })
    } else {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] })
    }
  })

  // Sound alert when new orders appear
  useEffect(() => {
    if (orders.length > prevOrderCount.current && prevOrderCount.current !== 0) {
      toast.success('🔔 Có đơn mới gửi đến bếp!')
    }
    prevOrderCount.current = orders.length
  }, [orders.length])

  // WebSocket send helper
  const sendStatusUpdate = (detailId: number, newStatus: OrderDetailStatus) => {
    if (stompClient?.connected) {
      stompClient.publish({
        destination: `/app/order-details/${detailId}/upd-status`,
        body: JSON.stringify(newStatus)
      })
    }
  }

  // Stats
  const allDetails = orders.flatMap((o) => o.orderDetails)
  const pendingCount = allDetails.filter((d) => d.status === 'PENDING').length
  const cookingCount = allDetails.filter((d) => d.status === 'COOKING').length
  const servedCount = allDetails.filter((d) => d.status === 'SERVED').length

  return (
    <div className='bg-background flex min-h-screen flex-col p-6 md:p-8'>
      {/* ── Header ── */}
      <header className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>Màn hình bếp (KDS)</h1>
          <p className='text-muted-foreground mt-1 text-sm'>Quản lý đơn theo thời gian thực cho bộ phận bếp</p>
        </div>
        <div className='bg-card border-border rounded-xl border px-5 py-3 shadow-sm'>
          <span className='font-mono text-2xl font-bold tabular-nums'>{formatClock(clock)}</span>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div className='mb-6 grid grid-cols-3 gap-4'>
        {[
          { label: 'Chờ chế biến', count: pendingCount, color: 'border-l-yellow-400', textColor: 'text-yellow-600' },
          { label: 'Đang chế biến', count: cookingCount, color: 'border-l-orange-400', textColor: 'text-orange-600' },
          { label: 'Sẵn sàng', count: servedCount, color: 'border-l-green-500', textColor: 'text-green-600' }
        ].map(({ label, count, color, textColor }) => (
          <div key={label} className={`bg-card border-border rounded-xl border border-l-4 p-4 shadow-sm ${color}`}>
            <p className={`text-4xl font-extrabold tabular-nums ${textColor}`}>{count}</p>
            <p className='text-muted-foreground mt-1 text-sm font-medium'>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Empty State ── */}
      {orders.length === 0 && (
        <div className='bg-card border-border flex flex-1 flex-col items-center justify-center rounded-xl border py-24 shadow-sm'>
          <span className='text-muted-foreground text-5xl'>🍽️</span>
          <p className='text-muted-foreground mt-4 text-lg font-medium'>Không có đơn nào đang hoạt động</p>
          <p className='text-muted-foreground mt-1 text-sm'>Các đơn CONFIRMED hoặc IN_PROGRESS sẽ xuất hiện ở đây</p>
        </div>
      )}

      {/* ── Order Cards Grid ── */}
      {orders.length > 0 && (
        <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {orders.map((order) => {
            const elapsedMin = getElapsedMinutes(order.createdAt)
            const allServed = order.orderDetails.every((d) => d.status === 'SERVED' || d.status === 'CANCELLED')
            const hasPending = order.orderDetails.some((d) => d.status === 'PENDING')

            // Chỉ tính cảnh báo khi còn món PENDING chưa nấu
            const isOverdue = hasPending && elapsedMin >= OVERDUE_MINUTES
            const isUrgent = hasPending && !isOverdue && elapsedMin >= URGENT_MINUTES

            const cardBorder = isOverdue
              ? 'border-red-400 shadow-red-100'
              : isUrgent
                ? 'border-orange-300 shadow-orange-50'
                : 'border-border'

            return (
              <div
                key={order.id}
                className={`bg-card flex flex-col rounded-xl border-2 shadow-sm transition-all duration-300 ${cardBorder}`}
              >
                {/* Card Header */}
                <div className='border-border flex items-center justify-between border-b px-4 py-3'>
                  <h2 className='text-foreground text-lg font-bold'>{order.tableName || 'Không có bàn'}</h2>
                  <div className='flex items-center gap-1.5'>
                    {isUrgent && (
                      <span className='inline-flex items-center rounded-md bg-orange-500 px-2.5 py-1 text-xs font-bold text-white'>
                        KHẨN CẤP
                      </span>
                    )}
                    {isOverdue && (
                      <span className='inline-flex items-center rounded-md bg-red-500 px-2.5 py-1 text-xs font-bold text-white'>
                        QUÁ HẠN
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className='border-border grid grid-cols-2 gap-x-4 border-b px-4 py-3 text-sm'>
                  <span className='text-foreground'>
                    <span className='text-muted-foreground font-medium'>Đơn: </span>
                    <span className='font-semibold'>{order.code}</span>
                  </span>
                  <span className='text-foreground'>
                    <span className='text-muted-foreground font-medium'>Thời gian: </span>
                    <span className='font-semibold'>{formatTime(order.createdAt)}</span>
                  </span>
                  <span className='text-foreground'>
                    <span className='text-muted-foreground font-medium'>Nhân viên: </span>
                    <span className='font-semibold'>{order.staffName || '—'}</span>
                  </span>
                  <span className={`font-semibold ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-500' : 'text-foreground'}`}>
                    <span className='text-muted-foreground font-medium'>Đã trôi qua: </span>
                    {elapsedMin} phút
                  </span>
                </div>

                {/* Order Details */}
                <div className='space-y-3 p-4'>
                  {order.orderDetails
                    .filter((d) => d.status !== 'CANCELLED')
                    .map((detail) => {
                      const name = detail.item?.name ?? detail.combo?.name ?? 'Món ăn'
                      const detailElapsed = detail.createdAt ? getElapsedMinutes(detail.createdAt) : elapsedMin

                      return (
                        <div
                          key={detail.id}
                          className='bg-muted/40 border-border rounded-lg border p-3'
                        >
                          {/* Item name + status badge */}
                          <div className='flex items-start justify-between gap-2'>
                            <p className='text-foreground text-sm font-bold'>
                              {detail.quantity}x {name}
                            </p>
                            <DetailStatusBadge status={detail.status} />
                          </div>

                          {/* Time info */}
                          <div className='mt-1.5 flex items-center justify-between'>
                            <div className='text-muted-foreground text-xs'>
                              {detail.createdAt && <span>Bắt đầu: {formatTime(detail.createdAt)} · </span>}
                              <span>{detailElapsed} phút</span>
                            </div>

                            {/* Action button */}
                            <div>
                              {detail.status === 'PENDING' && (
                                <button
                                  onClick={() => sendStatusUpdate(detail.id, 'COOKING')}
                                  className='rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-gray-700 active:scale-95'
                                >
                                  Bắt đầu nấu
                                </button>
                              )}
                              {detail.status === 'COOKING' && (
                                <button
                                  onClick={() => sendStatusUpdate(detail.id, 'SERVED')}
                                  className='border-border rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 active:scale-95'
                                >
                                  Đánh dấu sẵn sàng
                                </button>
                              )}
                              {detail.status === 'SERVED' && (
                                <button
                                  disabled
                                  className='cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-400'
                                >
                                  Đã phục vụ
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                  {/* All-served indicator */}
                  {allServed && order.orderDetails.length > 0 && (
                    <div className='mt-2 rounded-lg border border-green-200 bg-green-50 p-3 text-center'>
                      <p className='text-sm font-semibold text-green-700'>Tất cả món đã sẵn sàng để mang ra</p>
                      <p className='mt-0.5 text-xs text-green-600'>Đơn sẽ tự ẩn sau khi thanh toán</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default KitchenDisplay

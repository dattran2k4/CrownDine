import orderApi from '@/apis/order.api'
import { queryClient } from '@/main'
import type { Order } from '@/types/order.type'
import { useQuery, useMutation } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import { useState, useEffect, Fragment } from 'react'
import { useSubscription } from 'react-stomp-hooks'
import { toast } from 'sonner'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import OrderDrawer from './components/OrderDrawer'
import PaymentModal from './components/PaymentModal'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

const OrderManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dateFilterType, setDateFilterType] = useState<string>('ALL')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('ALL')
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getDateRange = () => {
    const today = new Date()
    // Local timezone offset hack to get YYYY-MM-DD reliably
    const offset = today.getTimezoneOffset()
    today.setMinutes(today.getMinutes() - offset)
    
    if (dateFilterType === 'TODAY') {
      const dateStr = today.toISOString().split('T')[0]
      return { fromDate: dateStr, toDate: dateStr }
    } else if (dateFilterType === 'YESTERDAY') {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]
      return { fromDate: dateStr, toDate: dateStr }
    } else if (dateFilterType === 'CUSTOM') {
      return { fromDate: customStartDate || undefined, toDate: customEndDate || undefined }
    }
    return { fromDate: undefined, toDate: undefined }
  }

  const { fromDate, toDate } = getDateRange()

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ['orders', statusFilter, fromDate, toDate],
    queryFn: () => orderApi.getAllOrders({
      status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
      fromDate,
      toDate
    }),
    select: (response) => response?.data?.data?.data ?? []
  })

  // WebSocket Subscription
  useSubscription('/topic/orders', (message) => {
    const updatedOrder = JSON.parse(message.body) as Order

    queryClient.setQueryData(['orders'], (oldData: AxiosResponse) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        data: {
          ...oldData.data,
          data: {
            ...oldData.data.data,
            data: oldData.data.data.data.map((t: Order) => (t.id === updatedOrder.id ? { ...t, ...updatedOrder } : t))
          }
        }
      }
    })
  })

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = order.code.toLowerCase().includes(q) || (order.tableName || '').toLowerCase().includes(q)
    
    let matchesType = true
    if (orderTypeFilter === 'RES') matchesType = order.code.startsWith('RES')
    else if (orderTypeFilter === 'ORD') matchesType = order.code.startsWith('ORD')

    return matchesSearch && matchesType
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  useEffect(() => {
    if (orders.length > 0) {
      if (paymentOrder) {
        const updated = orders.find((o: Order) => o.id === paymentOrder.id)
        if (updated) setPaymentOrder(updated)
      }
      if (selectedOrder) {
        const updated = orders.find((o: Order) => o.id === selectedOrder.id)
        if (updated) setSelectedOrder(updated)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, dateFilterType, customStartDate, customEndDate, orderTypeFilter])

  // Reset page to last possible if current page exceeds total pages due to deletions/updates
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRE_ORDER':
        return <Badge variant='warning'>Đặt trước</Badge>
      case 'CONFIRMED':
        return <Badge variant='outline'>Chờ xác nhận</Badge>
      case 'IN_PROGRESS':
        return <Badge variant='warning'>Đang phục vụ</Badge>
      case 'COMPLETED':
        return <Badge variant='success'>Hoàn thành</Badge>
      case 'CANCELLED':
        return <Badge variant='danger'>Đã hủy</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const handleCreateOrder = () => {
    setSelectedOrder(null)
    setIsDrawerOpen(true)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
  }

  const handlePayment = (order: Order) => {
    setPaymentOrder(order)
  }

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => orderApi.updateOrderStatus(orderId, 'CANCELLED'),
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (err: any) => {
      toast.error('Lỗi khi hủy đơn hàng: ' + err.message)
    }
  })

  const handleCancelOrder = (order: Order) => {
    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${order.code}?`)) {
      cancelOrderMutation.mutate(order.id)
    }
  }

  return (
    <div className='bg-background flex min-h-screen flex-col p-6 md:p-8'>
      {/* Header */}
      <header className='mb-6'>
        <h1 className='text-foreground text-3xl font-bold tracking-tight'>Đơn gọi món</h1>
        <p className='text-muted-foreground mt-1 text-sm'>Tìm nhanh theo Mã đơn, tên bàn hoặc ghi chú ngay bên dưới.</p>
      </header>

      {/* Toolbar & Filters */}
      <div className='bg-card border-border mb-6 flex flex-col gap-4 rounded-xl border p-4 shadow-sm'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
           <div className='relative w-full sm:max-w-xs'>
             <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
             <Input
               placeholder='Tìm theo Mã đơn, tên bàn...'
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className='bg-background pl-9 shadow-none'
             />
           </div>
           <Button
             onClick={handleCreateOrder}
             className='text-primary-foreground flex w-full items-center font-medium shadow-sm transition-all hover:shadow-md sm:w-auto'
           >
             <Plus className='mr-2 h-4 w-4' /> Tạo đơn mới
           </Button>
        </div>

        {/* Filters Row */}
        <div className='flex flex-wrap items-end gap-4 mt-2 md:mt-0 pt-3 border-t border-border'>
          <div className='flex flex-col gap-1.5 w-full sm:w-auto'>
            <label className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='bg-background border-border rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm outline-none w-full sm:w-[150px] transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20'
            >
              <option value='ALL'>Tất cả</option>
              <option value='PRE_ORDER'>Đặt trước</option>
              <option value='CONFIRMED'>Chờ xác nhận</option>
              <option value='IN_PROGRESS'>Đang phục vụ</option>
              <option value='COMPLETED'>Hoàn thành</option>
              <option value='CANCELLED'>Đã hủy</option>
            </select>
          </div>

          <div className='flex flex-col gap-1.5 w-full sm:w-auto'>
            <label className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>Loại đơn</label>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className='bg-background border-border rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm outline-none w-full sm:w-[170px] transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20'
            >
              <option value='ALL'>Tất cả</option>
              <option value='RES'>Đặt bàn trước (RES)</option>
              <option value='ORD'>Khách vãng lai (ORD)</option>
            </select>
          </div>

          <div className='flex flex-col gap-1.5 w-full sm:w-auto flex-1'>
            <label className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>Thời gian</label>
            <div className='flex flex-wrap sm:flex-nowrap items-center gap-2'>
              <select
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
                className='bg-background border-border rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm outline-none w-full sm:w-[150px] transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20'
              >
                <option value='ALL'>Mọi lúc</option>
                <option value='TODAY'>Hôm nay</option>
                <option value='YESTERDAY'>Hôm qua</option>
                <option value='CUSTOM'>Khoảng thời gian...</option>
              </select>

              {dateFilterType === 'CUSTOM' && (
                <div className='flex flex-1 items-center gap-2'>
                  <input
                    type='date'
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className='bg-background border-border rounded-md border px-2 py-1.5 text-sm font-medium shadow-sm outline-none w-full sm:w-auto transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20'
                  />
                  <span className='text-muted-foreground font-medium'>-</span>
                  <input
                    type='date'
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className='bg-background border-border rounded-md border px-2 py-1.5 text-sm font-medium shadow-sm outline-none w-full sm:w-auto transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20'
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-card border-border flex-1 overflow-hidden rounded-xl border shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm whitespace-nowrap'>
            <thead className='bg-muted/50 text-muted-foreground border-border border-b text-xs font-semibold'>
              <tr>
                <th className='px-6 py-4'>Mã đơn</th>
                <th className='px-6 py-4'>Ngày tạo</th>
                <th className='px-6 py-4'>Bàn</th>
                <th className='px-6 py-4'>Món</th>
                <th className='px-6 py-4'>Tạm tính</th>
                <th className='px-6 py-4'>Trạng thái</th>
                <th className='px-6 py-4 text-right'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='divide-border divide-y bg-white'>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const itemsCount = order.orderDetails?.reduce((acc, d) => acc + d.quantity, 0) || 0
                  return (
                    <tr key={order.id} className='hover:bg-muted/30 transition-colors'>
                      <td className='px-6 py-4'>
                        <span className='text-foreground font-bold'>#{order.code}</span>
                      </td>
                      <td className='text-foreground px-6 py-4'>
                        {new Date(order.createdAt).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className='text-foreground px-6 py-4 font-medium'>{order.tableName || '-'}</td>
                      <td className='text-foreground px-6 py-4'>{itemsCount}</td>
                      <td className='text-foreground px-6 py-4 font-bold'>
                        <span title={order.voucher ? `Voucher: ${order.voucher.code} - ${order.voucher.name}` : undefined}>
                          {(order.finalPrice ?? order.totalPrice).toLocaleString()} VND
                        </span>
                      </td>
                      <td className='px-6 py-4'>{getStatusBadge(order.status)}</td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='rounded-lg border-orange-200 font-semibold text-orange-600 shadow-sm hover:bg-orange-50 hover:text-orange-700'
                            onClick={() => handlePayment(order)}
                            disabled={order.status === 'CANCELLED' || order.status === 'COMPLETED'}
                          >
                            Thanh toán
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-foreground hover:bg-muted rounded-lg font-medium shadow-sm'
                            onClick={() => handleViewOrder(order)}
                          >
                            Xem chi tiết
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='rounded-lg border-red-200 text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700'
                            onClick={() => handleCancelOrder(order)}
                            disabled={
                              cancelOrderMutation.isPending ||
                              order.status === 'CANCELLED' ||
                              order.status === 'COMPLETED'
                            }
                          >
                            Hủy
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className='text-muted-foreground px-6 py-12 text-center'>
                    Không tìm thấy đơn hàng nào khớp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className='border-border flex justify-center border-t bg-gray-50/50 p-4'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages })
                  .map((_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(currentPage - p) <= 1)
                  .map((p, i, arr) => (
                    <Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          isActive={currentPage === p}
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(p)
                          }}
                          className='cursor-pointer shadow-sm'
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <OrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        order={selectedOrder}
        onPaymentClick={(order) => {
          setIsDrawerOpen(false)
          setPaymentOrder(order)
        }}
        onCancelClick={(order) => {
          setIsDrawerOpen(false)
          handleCancelOrder(order)
        }}
      />

      <PaymentModal
        isOpen={!!paymentOrder}
        onClose={() => setPaymentOrder(null)}
        order={paymentOrder}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['orders'] })
        }}
      />
    </div>
  )
}

export default OrderManagement

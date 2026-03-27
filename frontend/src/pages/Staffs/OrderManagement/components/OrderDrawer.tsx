import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { queryClient } from '@/main'
import { useMutation, useQuery } from '@tanstack/react-query'
import orderApi from '@/apis/order.api'
import tableApi from '@/apis/table.api'
import MenuSelector from '@/components/MenuSelector/MenuSelector'
import type { Order } from '@/types/order.type'
import type { MenuCardItem } from '@/types/item.type'

interface OrderDrawerProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null // null if creating a new order
  reservationId?: number | null
  preSelectedTableId?: string | number | null
  onPaymentClick?: (order: Order) => void
  onCancelClick?: (order: Order) => void
}

interface CartItem {
  cartId: string // unique random id for local list
  itemType: 'item' | 'combo'
  data: MenuCardItem
  quantity: number
  note?: string
  existingDetailId?: number // if it comes from the Order backend
  status?: string // PENDING, COOKING, etc for existing details
}

export default function OrderDrawer({ 
  isOpen, 
  onClose, 
  order, 
  reservationId, 
  preSelectedTableId,
  onPaymentClick, 
  onCancelClick 
}: OrderDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedTableId, setSelectedTableId] = useState<string>('')
  const [orderNote, setOrderNote] = useState<string>('')

  // Fetch tables to show in a dropdown
  const { data: tableData } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getAllTables()
  })

  // Load existing order details when editing
  useEffect(() => {
    if (order && order.orderDetails) {
      const existingCart: CartItem[] = order.orderDetails.map((detail) => {
        const dItem = detail.item || detail.combo
        return {
          cartId: `ext-${detail.id}-${Math.random()}`,
          itemType: detail.item ? 'item' : 'combo',
          data: {
            id: dItem?.id ?? 0,
            name: dItem?.name ?? 'Unknown',
            price: dItem?.price ?? 0,
            priceAfterDiscount: dItem?.priceAfterDiscount ?? null,
            categoryId: 0,
            description: '',
            imageUrl: dItem?.imageUrl ?? '',
            status: dItem?.status ?? 'AVAILABLE'
          },
          quantity: detail.quantity,
          note: detail.note,
          existingDetailId: detail.id,
          status: detail.status
        }
      })
      setCart(existingCart)
      // Extract table ID if possible (backend might not send tableId directly on Order, map it if needed)
      // For now, if order has no tableId available, we leave it empty.
    } else if (order) {
      // Order exists but no details yet
      setCart([])
    } else {
      setCart([])
      setSelectedTableId(preSelectedTableId ? preSelectedTableId.toString() : '')
      setOrderNote('')
    }
  }, [order, isOpen, preSelectedTableId])

  const handleSelectItem = (item: MenuCardItem, type: 'item' | 'combo') => {
    setCart((prev) => [
      ...prev,
      {
        cartId: `loc-${Date.now()}-${Math.random()}`,
        itemType: type,
        data: item,
        quantity: 1
      }
    ])
  }

  const handleRemoveCartItem = async (cartId: string, existingDetailId?: number) => {
    if (existingDetailId) {
      try {
        await orderApi.deleteOrderDetail(existingDetailId)
        toast.success('Đã xóa món khỏi đơn.')
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      } catch (err: any) {
        return
      }
    }
    setCart((prev) => prev.filter((c) => c.cartId !== cartId))
  }

  const handleQuantityChange = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.cartId === cartId) {
          const newQ = Math.max(1, c.quantity + delta) // Prevent dropping below 1
          return { ...c, quantity: newQ }
        }
        return c
      })
    )
  }

  const createOrderMutation = useMutation({
    mutationFn: async (): Promise<any> => {
      if (reservationId) {
        return orderApi.openOrderForReservation(reservationId, {
          items: cart.map((c) => ({
            itemId: c.itemType === 'item' ? c.data.id : undefined,
            comboId: c.itemType === 'combo' ? c.data.id : undefined,
            quantity: c.quantity,
            note: orderNote || undefined
          }))
        })
      }

      return orderApi.createOrder({
        tableId: selectedTableId ? Number(selectedTableId) : null,
        items: cart.map((c) => ({
          itemId: c.itemType === 'item' ? c.data.id : undefined,
          comboId: c.itemType === 'combo' ? c.data.id : undefined,
          quantity: c.quantity,
          note: orderNote || undefined
        }))
      })
    },
    onSuccess: () => {
      toast.success('Tạo đơn thành công!')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['staff-reservations'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error('Lỗi: ' + err.message)
    }
  })

  const addDetailsMutation = useMutation({
    mutationFn: () => {
      if (!order?.id) throw new Error('No order ID')
      const newItems = cart.filter((c) => !c.existingDetailId)
      if (newItems.length === 0) return Promise.resolve(null)
      return orderApi.addOrderDetails(order.id, {
        items: newItems.map((c) => ({
          itemId: c.itemType === 'item' ? c.data.id : undefined,
          comboId: c.itemType === 'combo' ? c.data.id : undefined,
          quantity: c.quantity,
          note: undefined // Assuming item-level note if needed, but the current UI implies a global note or no note
        }))
      })
    },
    onSuccess: (res) => {
      if (res) toast.success('Đã thêm món vào đơn!')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error('Lỗi: ' + err.message)
    }
  })

  const handleSave = () => {
    if (order) {
      // Editing existing order -> pushing new items only
      addDetailsMutation.mutate()
    } else {
      // Creating new order
      if (cart.length === 0) {
        toast.warning('Vui lòng chọn ít nhất một món để tạo đơn.')
        return
      }
      createOrderMutation.mutate()
    }
  }

  const handlePayment = async () => {
    if (!order) {
      toast.warning('Vui lòng lưu đơn trước khi thanh toán.')
      return
    }
    if (onPaymentClick) {
      onPaymentClick(order)
    }
  }

  const totalPrice = cart.reduce((acc, c) => acc + (c.data.priceAfterDiscount ?? c.data.price) * c.quantity, 0)
  const discountPrice = order?.discountPrice || 0
  const finalPrice = Math.max(0, totalPrice - discountPrice)
  const isSaving = createOrderMutation.isPending || addDetailsMutation.isPending
  const hasNewItems = cart.some((c) => !c.existingDetailId)
  const tables = tableData?.data?.data || []

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer content */}
      <div
        className={`bg-background fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col shadow-2xl transition-transform duration-300 sm:max-w-[90vw] md:max-w-[1200px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Modern minimal header */}
        <div className='border-border flex flex-row items-center justify-between border-b px-6 py-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={onClose}
              className='h-8 w-8 flex-shrink-0 rounded-full shadow-sm'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>{order ? `Đơn #${order.code}` : 'Tạo đơn mới'}</h2>
              {order && (
                <p className='text-muted-foreground mt-1 text-xs'>
                  Bàn: <span className='font-semibold'>{order.tableName || '-'}</span> &middot; Tạo lúc{' '}
                  {new Date(order.createdAt).toLocaleString('vi-VN')} &middot; Trạng thái:{' '}
                  <span className='text-primary font-semibold'>{order.status}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className='flex flex-1 flex-col overflow-hidden lg:flex-row'>
          {/* Left Column: Menu Selector */}
          <div className='bg-muted/30 border-border h-full flex-1 overflow-hidden border-r p-6'>
            <div className='mb-4 hidden text-lg font-bold lg:block'>Thêm món/combo</div>
            <div className='h-[calc(100%-2rem)]'>
              <MenuSelector onSelectItem={handleSelectItem} />
            </div>
          </div>

          {/* Right Column: Order Cart */}
          <div className='bg-background flex w-full flex-col lg:w-5/12 xl:w-1/3'>
            {/* Top Config for new orders */}
            {!order && !reservationId && (
              <div className='border-border flex items-center gap-2 border-b p-4'>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className='bg-card border-border rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none'
                >
                  <option value=''>Chọn bàn</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <input
                  type='text'
                  placeholder='Ghi chú...'
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className='bg-card border-border flex-1 rounded-md border px-3 py-2 text-sm shadow-sm outline-none'
                />
              </div>
            )}

            {!order && reservationId && (
              <div className='border-border border-b p-4'>
                <p className='text-muted-foreground text-sm'>
                  Đơn hàng này sẽ được tạo từ đặt bàn hiện tại. Bàn và khách sẽ lấy theo reservation.
                </p>
              </div>
            )}

            {/* Cart Items List */}
            <div className='flex-1 overflow-y-auto p-4'>
              <h3 className='mb-4 text-lg font-bold'>Danh sách món</h3>

              {cart.length === 0 ? (
                <div className='text-muted-foreground flex h-32 flex-col items-center justify-center'>
                  <p className='text-sm'>Đơn hàng trống</p>
                </div>
              ) : (
                <div className='flex flex-col gap-4'>
                  {cart.map((c, idx) => {
                    const price = c.data.priceAfterDiscount ?? c.data.price
                    return (
                      <div key={c.cartId} className='border-border flex gap-3 border-b pb-4 last:border-0 last:pb-0'>
                        <div className='text-muted-foreground w-6 pt-1 text-sm font-bold'>{idx + 1}</div>
                        <div className='flex-1'>
                          <h4 className='leading-tight font-semibold'>{c.data.name}</h4>
                          <div className='text-muted-foreground mt-2 flex items-center gap-4 text-xs font-medium'>
                            <span>{price.toLocaleString()}đ</span>
                            <div className='border-border bg-muted/30 flex items-center gap-2 rounded-md border px-1 py-0.5'>
                              <button
                                onClick={() => handleQuantityChange(c.cartId, -1)}
                                className='hover:bg-background hover:text-primary flex h-5 w-5 items-center justify-center rounded-sm shadow-sm transition-colors disabled:opacity-50'
                                disabled={c.quantity <= 1}
                              >
                                -
                              </button>
                              <span className='w-4 text-center'>{c.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(c.cartId, 1)}
                                className='hover:bg-background hover:text-primary flex h-5 w-5 items-center justify-center rounded-sm shadow-sm transition-colors'
                              >
                                +
                              </button>
                            </div>
                          </div>
                          {c.status && (
                            <div className='bg-muted text-primary mt-2 inline-block rounded-sm px-2 py-0.5 text-[10px] font-medium'>
                              Tiến trình: {c.status}
                            </div>
                          )}
                        </div>
                        <div className='flex flex-col items-end justify-between'>
                          <span className='text-sm font-bold'>{(price * c.quantity).toLocaleString()} VND</span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveCartItem(c.cartId, c.existingDetailId)}
                            className='h-7 px-2 text-red-500 hover:bg-red-50 hover:text-red-600'
                            disabled={order?.status === 'CANCELLED' || order?.status === 'COMPLETED'}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary & Actions */}
            <div className='border-border bg-card/50 flex flex-col gap-2 border-t p-4'>
              {order && discountPrice > 0 && (
                <div className='flex items-center justify-between text-sm text-muted-foreground'>
                  <span>Tổng tiền món:</span>
                  <span>{totalPrice.toLocaleString()} VND</span>
                </div>
              )}
              {order && discountPrice > 0 && (
                <div className='flex items-center justify-between text-sm text-green-600'>
                  <span>Giảm giá:</span>
                  <span>-{discountPrice.toLocaleString()} VND</span>
                </div>
              )}
              <div className='flex items-center justify-between text-lg font-bold'>
                <span>Tạm tính:</span>
                <span className='text-primary'>{finalPrice.toLocaleString()} VND</span>
              </div>
              <div className='mt-2 flex items-center justify-between gap-2 xl:justify-end xl:gap-4'>
                <Button
                  onClick={order ? handlePayment : handleSave}
                  disabled={isSaving || order?.status === 'CANCELLED' || order?.status === 'COMPLETED'}
                  className='h-11 flex-1 xl:flex-none'
                >
                  {isSaving ? 'Đang lưu...' : order ? 'Thanh toán' : 'Tạo đơn'}
                </Button>
                {order && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || order.status === 'CANCELLED' || order.status === 'COMPLETED' || !hasNewItems}
                    variant='secondary'
                    className={cn(
                      'border-border h-11 flex-1 border shadow-sm xl:flex-none',
                      !hasNewItems ? 'opacity-40 grayscale cursor-not-allowed' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                    )}
                  >
                    {isSaving ? 'Đang gửi...' : 'Thông báo bếp'}
                  </Button>
                )}
                {order && (
                  <Button 
                    variant='destructive' 
                    onClick={() => {
                      if (onCancelClick) onCancelClick(order)
                    }} 
                    className='h-11 flex-1 xl:flex-none'
                    disabled={order.status === 'CANCELLED' || order.status === 'COMPLETED'}
                  >
                    Hủy đơn
                  </Button>
                )}
                {!order && (
                  <Button variant='destructive' onClick={onClose} className='h-11 flex-1 xl:flex-none'>
                    Hủy
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

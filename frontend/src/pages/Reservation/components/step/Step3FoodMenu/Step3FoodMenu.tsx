import type { PreOrderCartItem } from '@/types/reservation.type'
import { formatCurrency, getImageUrl } from '@/utils/utils'
import { Info, Minus, Plus, ShoppingCart, Trash2, PenLine } from 'lucide-react'
import CountdownTimer from '@/pages/Reservation/components/CountdownTimer'
import MenuSelector from '@/components/MenuSelector/MenuSelector'
import type { MenuCardItem } from '@/types/item.type'
import { toast } from 'react-toastify'

/** Một mục có thể thêm vào giỏ (món hoặc combo) */
type PreOrderEntry = Omit<PreOrderCartItem, 'quantity'>

interface Props {
  cartItems: PreOrderCartItem[]
  onAdd: (entry: PreOrderEntry) => void
  onRemove: (type: 'item' | 'combo', id: number) => void
  updateQuantity: (type: 'item' | 'combo', id: number, delta: number) => void
  onUpdateNote: (type: 'item' | 'combo', id: number, note: string) => void
  expiratedAt: string | null
}

const Step3FoodMenu = ({ cartItems, onAdd, onRemove, updateQuantity, onUpdateNote, expiratedAt }: Props) => {
  const foodTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const handleSelectItem = (item: MenuCardItem, type: 'item' | 'combo') => {
    onAdd({
      type,
      id: item.id,
      name: item.name,
      price: Number(item.priceAfterDiscount ?? item.price),
      image: item.imageUrl
    })
  }

  return (
    <div className='animate-fade-in flex flex-col overflow-hidden lg:h-[700px] lg:flex-row'>
      {/* Left Column: Menu Selection */}
      <div className='bg-muted/10 flex flex-1 flex-col overflow-hidden border-r p-4 lg:p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-bold text-gray-900'>Chọn món ăn & combo</h3>
            <p className='text-muted-foreground text-xs'>Sẵn sàng phục vụ khi bạn tới nhà hàng</p>
          </div>
          {expiratedAt && (
            <div className='flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 border border-orange-200'>
              <CountdownTimer
                expiratedAt={expiratedAt}
                onExpire={() => {
                  toast.error('Hết phiên giao dịch! Vui lòng đặt lại.')
                  window.location.reload()
                }}
              />
            </div>
          )}
        </div>

        <div className='flex-1 overflow-hidden h-full'>
          <MenuSelector onSelectItem={handleSelectItem} />
        </div>
      </div>

      {/* Right Column: Mini Cart / Summary */}
      <div className='bg-background flex w-full flex-col border-t lg:w-[400px] lg:border-t-0'>
        {/* Cart Header */}
        <div className='border-border flex items-center justify-between border-b p-4 lg:px-6 lg:py-5'>
          <div className='flex items-center gap-2'>
            <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg'>
              <ShoppingCart size={18} />
            </div>
            <h4 className='font-bold text-gray-900'>Món đã chọn</h4>
          </div>
          <span className='bg-primary text-primary-foreground flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold'>
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>

        {/* Cart Items List */}
        <div className='custom-scrollbar flex-1 overflow-y-auto p-4 lg:p-6'>
          {cartItems.length === 0 ? (
            <div className='flex h-48 flex-col items-center justify-center text-center opacity-40'>
              <div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <ShoppingCart size={32} />
              </div>
              <p className='text-sm font-medium'>Giỏ hàng của bạn đang trống</p>
              <p className='mt-1 text-xs'>Chọn món bên trái để thêm vào đơn</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {cartItems.map((item) => (
                <div key={`${item.type}-${item.id}`} className='group border-border flex flex-col gap-3 border-b pb-4 last:border-0 last:pb-0'>
                  <div className='flex gap-3'>
                    <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50'>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className='h-full w-full object-cover'
                      />
                    </div>
                    <div className='flex flex-1 flex-col justify-between py-0.5'>
                      <div className='flex items-start justify-between gap-2'>
                        <h5 className='line-clamp-1 text-sm font-bold text-gray-900'>{item.name}</h5>
                        <button
                          onClick={() => onRemove(item.type, item.id)}
                          className='text-muted-foreground hover:text-destructive transition-colors'
                          title='Xóa món'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className='mt-2 flex items-center justify-between'>
                        <p className='text-primary text-xs font-semibold'>{formatCurrency(item.price)}</p>
                        <div className='border-border flex items-center gap-3 rounded-md border bg-white px-1 py-0.5'>
                          <button
                            onClick={() => updateQuantity(item.type, item.id, -1)}
                            className='hover:bg-muted text-muted-foreground hover:text-foreground flex h-5 w-5 items-center justify-center rounded transition-colors disabled:opacity-30'
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <span className='w-4 text-center text-xs font-bold'>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.type, item.id, 1)}
                            className='hover:bg-muted text-muted-foreground hover:text-foreground flex h-5 w-5 items-center justify-center rounded transition-colors'
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Note Input */}
                  <div className='relative mt-1'>
                    <PenLine size={12} className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2' />
                    <input
                      type='text'
                      placeholder='Thêm ghi chú (vị cay, dị ứng...)'
                      value={item.note || ''}
                      onChange={(e) => onUpdateNote(item.type, item.id, e.target.value)}
                      className='bg-muted/30 border-border w-full rounded-md border py-1.5 pr-3 pl-8 text-[11px] outline-none transition-all focus:border-primary focus:bg-white'
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer / Summary */}
        <div className='bg-muted/30 border-border border-t p-4 lg:p-6'>
          <div className='mb-4 space-y-2'>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>Tạm tính món ăn</span>
              <span>{formatCurrency(foodTotal)}</span>
            </div>
          </div>
          
          <div className='mb-4 flex items-center justify-between border-t border-dashed border-gray-300 pt-4'>
            <span className='text-sm font-bold text-gray-900 uppercase tracking-tight'>Tổng cộng</span>
            <span className='text-primary text-xl font-black'>{formatCurrency(foodTotal)}</span>
          </div>

          <div className='flex items-center gap-2 rounded-lg bg-blue-50 p-2 border border-blue-100'>
            <Info size={14} className='text-blue-600 flex-shrink-0' />
            <p className='text-[10px] text-blue-700 leading-tight'>
              Sau khi chọn xong, vui lòng nhấn <strong>Tiếp tục</strong> ở dưới để sang bước thanh toán cọc.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3FoodMenu

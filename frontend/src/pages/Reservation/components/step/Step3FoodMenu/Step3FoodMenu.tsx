import { type MenuItem } from '@/pages/Reservation/data'
import itemApi from '@/apis/item.api'
import { formatCurrency, getImageUrl } from '@/utils/utils'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Search, Trash2, Utensils } from 'lucide-react'

interface CartItem extends MenuItem {
  quantity: number
}

/** Item dùng cho danh sách đặt món (map từ API, tương thích MenuItem) */
function toReservationMenuItem(item: {
  id: number
  name: string
  price: number
  priceAfterDiscount?: number | null
  imageUrl: string
}): MenuItem {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.priceAfterDiscount ?? item.price),
    image: item.imageUrl
  }
}

interface Props {
  cartItems: CartItem[]
  onAdd: (item: MenuItem) => void
  onRemove: (itemId: number) => void
}

const Step3FoodMenu = ({ cartItems, onAdd, onRemove }: Props) => {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: itemsData, isPending: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemApi.getItems()
  })

  const menuItems = useMemo(() => {
    const raw = itemsData?.data?.data ?? []
    return raw
      .filter((i) => i.status === 'AVAILABLE')
      .map(toReservationMenuItem)
  }, [itemsData?.data?.data])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems
    const q = searchQuery.trim().toLowerCase()
    return menuItems.filter((item) => item.name.toLowerCase().includes(q))
  }, [menuItems, searchQuery])

  const foodTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <div className='animate-fade-in space-y-6 p-4 m-4'>
      {/* Header & Subtotal */}
      <div className='flex items-end justify-between border-b pb-4'>
        <div>
          <h3 className='flex items-center gap-2 text-lg font-bold'>
            <Utensils size={20} /> Đặt món trước (Tuỳ chọn)
          </h3>
          <p className='text-muted-foreground text-sm'>Món ăn sẽ được chuẩn bị sẵn khi bạn đến.</p>
        </div>
        <div className='text-right'>
          <p className='text-muted-foreground text-xs'>Tạm tính món ăn</p>
          <p className='text-primary text-xl font-bold'>{formatCurrency(foodTotal)}</p>
        </div>
      </div>

      {/* Search theo tên */}
      {!itemsLoading && menuItems.length > 0 && (
        <div className='relative'>
          <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
          <input
            type='text'
            placeholder='Tìm theo tên món...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='border-border bg-card w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary'
          />
        </div>
      )}

      {/* Menu Grid - từ API, có con lăn chuột */}
      {itemsLoading ? (
        <p className='text-muted-foreground py-8 text-center text-sm'>Đang tải danh sách món...</p>
      ) : (
        <div className='custom-scrollbar max-h-[45vh] overflow-y-auto pr-1'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {filteredItems.length === 0 ? (
              <p className='text-muted-foreground col-span-full py-6 text-center text-sm'>
                {searchQuery.trim() ? 'Không tìm thấy món phù hợp.' : 'Chưa có món nào.'}
              </p>
            ) : (
              filteredItems.map((item) => (
            <div key={item.id} className='bg-card group flex gap-4 rounded-lg border p-3 transition-all hover:shadow-md'>
              <div className='h-24 w-24 overflow-hidden rounded-md'>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className='h-full w-full bg-gray-200 object-cover transition-transform duration-300 group-hover:scale-110'
                />
              </div>
              <div className='flex flex-1 flex-col justify-between'>
                <div>
                  <h4 className='line-clamp-1 font-bold'>{item.name}</h4>
                  <p className='text-primary text-sm font-bold'>{formatCurrency(item.price)}</p>
                </div>
                <button
                  onClick={() => onAdd(item)}
                  className='bg-foreground hover:bg-primary self-end rounded px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors'
                >
                  + Thêm
                </button>
              </div>
            </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mini Cart Display (Chỉ hiện khi có món) */}
      {cartItems.length > 0 && (
        <div className='animate-slide-up mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4'>
          <h4 className='mb-3 flex items-center justify-between text-sm font-bold'>
            <span>Đã chọn ({cartItems.length} món):</span>
            <span className='text-muted-foreground text-xs font-normal'>Sẽ thanh toán tại nhà hàng</span>
          </h4>
          <div className='custom-scrollbar max-h-48 space-y-2 overflow-y-auto pr-2'>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between rounded border border-gray-100 bg-white p-2 text-sm shadow-sm'
              >
                <span className='flex items-center gap-2'>
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold'>
                    {item.quantity}x
                  </span>
                  {item.name}
                </span>
                <div className='flex items-center gap-3'>
                  <span className='font-medium text-gray-600'>{formatCurrency(item.price * item.quantity)}</span>
                  <button
                    onClick={() => onRemove(item.id)}
                    className='rounded p-1 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500'
                    title='Xoá món này'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Step3FoodMenu

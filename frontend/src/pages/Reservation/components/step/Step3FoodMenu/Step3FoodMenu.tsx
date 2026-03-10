import { type PreOrderCartItem } from '@/pages/Reservation/data'
import comboApi from '@/apis/combo.api'
import itemApi from '@/apis/item.api'
import { formatCurrency, getImageUrl } from '@/utils/utils'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Search, Trash2, Utensils, Info } from 'lucide-react'
import CountdownTimer from '@/pages/Reservation/components/CountdownTimer'

/** Một mục có thể thêm vào giỏ (món hoặc combo) */
type PreOrderEntry = Omit<PreOrderCartItem, 'quantity'>

interface Props {
  cartItems: PreOrderCartItem[]
  onAdd: (entry: PreOrderEntry) => void
  onRemove: (type: 'item' | 'combo', id: number) => void
  reservationId: number
  expiratedAt: string | null
}

const Step3FoodMenu = ({ cartItems, onAdd, onRemove, reservationId, expiratedAt }: Props) => {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: itemsData, isPending: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemApi.getItems()
  })

  const { data: combosData, isPending: combosLoading } = useQuery({
    queryKey: ['combos'],
    queryFn: () => comboApi.getCombos()
  })

  const menuEntries = useMemo((): PreOrderEntry[] => {
    const items =
      itemsData?.data?.data
        ?.filter((i) => i.status === 'AVAILABLE')
        .map((i) => ({
          type: 'item' as const,
          id: i.id,
          name: i.name,
          price: Number(i.priceAfterDiscount ?? i.price),
          image: i.imageUrl
        })) ?? []
    const combos =
      combosData?.data?.data
        ?.filter((c) => c.status === 'AVAILABLE')
        .map((c) => ({
          type: 'combo' as const,
          id: c.id,
          name: c.name,
          price: Number(c.priceAfterDiscount ?? c.price),
          image: c.imageUrl ?? ''
        })) ?? []
    return [...items, ...combos]
  }, [itemsData?.data?.data, combosData?.data?.data])

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return menuEntries
    const q = searchQuery.trim().toLowerCase()
    return menuEntries.filter((e) => e.name.toLowerCase().includes(q))
  }, [menuEntries, searchQuery])

  const isLoading = itemsLoading || combosLoading
  const hasEntries = menuEntries.length > 0

  const foodTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <div className='animate-fade-in space-y-6 p-6'>
      {/* Alert Header & Timer */}
      {expiratedAt && (
        <div className='rounded-lg border border-yellow-300 bg-yellow-50 p-4'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <div className='flex items-center gap-3'>
              <Info className='text-yellow-600' size={20} />
              <span className='text-sm font-medium text-yellow-900'>Vui lòng hoàn tất trong thời gian giữ vé.</span>
            </div>
            <CountdownTimer
              expiratedAt={expiratedAt}
              onExpire={() => {
                alert('Hết phiên giao dịch! Vui lòng đặt lại.')
                window.location.reload()
              }}
            />
          </div>
        </div>
      )}

      {/* Header & Subtotal */}
      <div className='flex items-end justify-between rounded-lg bg-gray-50 p-5 border border-gray-200'>
        <div className='flex-1'>
          <h3 className='flex items-center gap-3 text-xl font-bold text-gray-900 mb-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500'>
              <Utensils className='text-white' size={20} />
            </div>
            Đặt món trước (Tuỳ chọn)
          </h3>
          <p className='text-gray-600 text-sm ml-[3.25rem]'>Món ăn sẽ được chuẩn bị sẵn khi bạn đến.</p>
        </div>
        <div className='text-right bg-white rounded-lg px-4 py-3 border border-gray-200'>
          <p className='text-gray-500 text-xs font-medium mb-1'>Tạm tính món ăn</p>
          <p className='text-orange-600 text-2xl font-bold'>{formatCurrency(foodTotal)}</p>
        </div>
      </div>

      {/* Search theo tên */}
      {!isLoading && hasEntries && (
        <div className='relative'>
          <div className='absolute left-4 top-1/2 -translate-y-1/2 z-10'>
            <Search className='text-gray-400 h-5 w-5' />
          </div>
          <input
            type='text'
            placeholder='Tìm theo tên món...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200'
          />
        </div>
      )}

      {/* Menu Grid - Modern Card Design */}
      {isLoading ? (
        <div className='py-12 text-center'>
          <div className='inline-flex flex-col items-center gap-3'>
            <div className='h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500'></div>
            <p className='text-gray-500 text-sm font-medium'>Đang tải danh sách món và combo...</p>
          </div>
        </div>
      ) : (
        <div className='custom-scrollbar max-h-[45vh] overflow-y-auto pr-2'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredEntries.length === 0 ? (
              <div className='col-span-full py-12 text-center'>
                <div className='inline-flex flex-col items-center gap-3'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                    <Search className='h-8 w-8 text-gray-400' />
                  </div>
                  <p className='text-gray-500 text-sm font-medium'>
                {searchQuery.trim() ? 'Không tìm thấy món/combo phù hợp.' : 'Chưa có món hoặc combo nào.'}
              </p>
                </div>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={`${entry.type}-${entry.id}`}
                  className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-400 hover:shadow-md'
                >
                  <div className='mb-3 h-40 w-full overflow-hidden rounded-lg bg-gray-100'>
                    <img
                      src={getImageUrl(entry.image)}
                      alt={entry.name}
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <div className='space-y-3'>
                    <div>
                      <div className='flex items-start justify-between gap-2 mb-2'>
                        <h4 className='line-clamp-2 flex-1 font-semibold text-gray-900 text-sm leading-tight'>{entry.name}</h4>
                        {entry.type === 'combo' && (
                          <span className='shrink-0 rounded bg-orange-500 px-2 py-1 text-[10px] font-bold text-white'>
                            COMBO
                          </span>
                        )}
                      </div>
                      <p className='text-orange-600 text-lg font-bold'>{formatCurrency(entry.price)}</p>
                    </div>
                    <button
                      onClick={() => onAdd(entry)}
                      className='w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600'
                    >
                      + Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mini Cart Display */}
      {cartItems.length > 0 && (
        <div className='mt-6 rounded-lg border border-dashed border-orange-300 bg-orange-50 p-5'>
          <div className='mb-4 flex items-center justify-between'>
            <h4 className='flex items-center gap-2 text-base font-bold text-gray-900'>
              <span className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold'>
                {cartItems.length}
              </span>
              Đã chọn món
          </h4>
            <span className='rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200'>
              Thanh toán tại nhà hàng
            </span>
          </div>
          <div className='custom-scrollbar max-h-64 space-y-2 overflow-y-auto'>
            {cartItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className='flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3'
              >
                <span className='flex items-center gap-3'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-xs font-bold text-white'>
                    {item.quantity}x
                  </span>
                  <div>
                    <p className='font-medium text-gray-900 text-sm'>{item.name}</p>
                  {item.type === 'combo' && (
                      <span className='text-orange-600 text-[10px] font-medium'>Combo</span>
                  )}
                  </div>
                </span>
                <div className='flex items-center gap-3'>
                  <span className='font-semibold text-gray-900'>{formatCurrency(item.price * item.quantity)}</span>
                  <button
                    onClick={() => onRemove(item.type, item.id)}
                    className='rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500'
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

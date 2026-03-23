import RatingStart from '@/components/RatingStart'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFavoriteStore } from '@/stores/useFavoriteStore'
import type { MenuCardItem } from '@/types/item.type'
import { formatCurrency, getImageUrl } from '@/utils/utils'
import { Eye, Heart } from 'lucide-react'
import { toast } from 'react-toastify'

interface Props {
  item: MenuCardItem
  isCombo?: boolean
  onViewDetails?: (item: MenuCardItem) => void
}

const ItemCard = ({ item, isCombo = false, onViewDetails }: Props) => {
  const { isFavoriteItem, isFavoriteCombo, addFavoriteItem, addFavoriteCombo, removeFavoriteItem, removeFavoriteCombo } =
    useFavoriteStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const isFavorite = isCombo ? isFavoriteCombo(item.id) : isFavoriteItem(item.id)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để sử dụng tính năng này')
      return
    }

    if (isFavorite) {
      if (isCombo) {
        await removeFavoriteCombo(item.id)
      } else {
        await removeFavoriteItem(item.id)
      }
    } else {
      if (isCombo) {
        await addFavoriteCombo(item.id)
      } else {
        await addFavoriteItem(item.id)
      }
    }
  }

  const discountPercent = item.priceAfterDiscount
    ? Math.round(((item.price - item.priceAfterDiscount) / item.price) * 100)
    : 0
  return (
    <div className='group bg-card border-border hover:border-primary/50 relative flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md'>
      {/* --- BADGES (New, Best Seller, Discount) --- */}
      <div className='absolute top-3 left-3 z-10 flex flex-col gap-1'>
        {discountPercent > 0 && (
          <span className='bg-destructive text-destructive-foreground rounded px-2 py-1 text-xs font-bold shadow-sm'>
            -{discountPercent}%
          </span>
        )}
        {item.tags?.includes('BEST_SELLER') && (
          <span className='rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-white shadow-sm'>BEST SELLER</span>
        )}
        {item.tags?.includes('NEW') && (
          <span className='rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white shadow-sm'>NEW</span>
        )}
      </div>

      {/* Button Like */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-3 right-3 z-10 rounded-full p-2 shadow-sm backdrop-blur-sm transition-all duration-300 ${
          isFavorite ? 'bg-primary text-white scale-110' : 'bg-white/80 text-muted-foreground hover:text-red-500 hover:scale-110'
        }`}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
      {/* Image Area */}
      <div className='relative h-56 overflow-hidden'>
        <img
          src={getImageUrl(item.imageUrl)}
          alt={item.name}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
        />
        {/* Badge category */}
        {item.status === 'SOLD_OUT' && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
            <span className='rotate-12 border-2 border-white px-4 py-1 text-lg font-bold text-white'>SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-2 flex items-start justify-between'>
          <h3 className='text-foreground text-xl font-bold'>{item.name}</h3>
        </div>

        <p className='text-muted-foreground mb-4 line-clamp-2 flex-1 text-sm'>{item.description}</p>

        {/* Rating */}
        <div className='mb-4 flex items-center gap-2'>
          <RatingStart rating={item.averageRating || 0} size={18} />
          <span className='text-muted-foreground pt-0.5 text-xs font-medium'>
            {item.averageRating ? item.averageRating.toFixed(1) : '0.0'} ({item.feedbackCount || 0})
          </span>
        </div>

        {/* Price & Action */}
        <div className='border-border mt-auto flex items-center justify-between border-t border-dashed pt-3'>
          <div className='flex flex-col'>
            {item.priceAfterDiscount ? (
              <>
                <span className='text-muted-foreground text-xs line-through'>
                  {formatCurrency(Number(item.price))}
                </span>
                <span className='text-primary text-xl font-bold'>
                  {formatCurrency(Number(item.priceAfterDiscount))}
                </span>
              </>
            ) : (
              <span className='text-primary text-xl font-bold'>{formatCurrency(Number(item.price))}</span>
            )}
          </div>

          <button
            onClick={() => onViewDetails && onViewDetails(item)}
            disabled={item.status === 'SOLD_OUT'}
            className='btn-auth flex items-center gap-2 px-4! py-2! text-sm! disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Eye size={16} />
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemCard

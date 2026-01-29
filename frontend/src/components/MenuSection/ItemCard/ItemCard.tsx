import RatingStart from '@/components/RatingStart'
import type { Item } from '@/types/item.type'
import { Heart, ShoppingCart } from 'lucide-react'

interface Props {
  item: Item
  onAddToCart?: (item: Item) => void
}

const ItemCard = ({ item, onAddToCart }: Props) => {
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

      {/* Button Like (Optional) */}
      <button className='text-muted-foreground absolute top-3 right-3 z-10 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:text-red-500'>
        <Heart size={18} />
      </button>
      {/* Image Area */}
      <div className='relative h-56 overflow-hidden'>
        <img
          src={item.imageUrl}
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
          <RatingStart rating={item.rating} size={18} />
          <span className='text-muted-foreground pt-0.5 text-xs font-medium'>({item.rating})</span>
        </div>

        {/* Price & Action */}
        <div className='border-border mt-auto flex items-center justify-between border-t border-dashed pt-3'>
          <div className='flex flex-col'>
            {item.priceAfterDiscount ? (
              <>
                <span className='text-muted-foreground text-xs line-through'>${item.price}</span>
                <span className='text-primary text-xl font-bold'>${item.priceAfterDiscount}</span>
              </>
            ) : (
              <span className='text-primary text-xl font-bold'>${item.price}</span>
            )}
          </div>

          <button
            onClick={() => onAddToCart && onAddToCart(item)}
            disabled={item.status === 'SOLD_OUT'}
            className='btn-auth flex items-center gap-2 px-4! py-2! text-sm! disabled:cursor-not-allowed disabled:opacity-50'
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemCard

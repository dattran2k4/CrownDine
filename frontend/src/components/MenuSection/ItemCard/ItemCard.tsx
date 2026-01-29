import RatingStart from '@/components/RatingStart'
export interface Item {
  id: number
  name: string
  description: string
  price: number
  image: string
  rating: number
  category: string
}

interface Props {
  item: Item
  onAddToCart?: (item: Item) => void
}

const ItemCard = ({ item, onAddToCart }: Props) => {
  return (
    <div className='group bg-card border-border flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md'>
      {/* Image Area */}
      <div className='relative h-56 overflow-hidden'>
        <img
          src={item.image}
          alt={item.name}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
        />
        {/* Badge category */}
        <div className='absolute top-3 left-3 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-md'>
          {item.category}
        </div>
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
        <div className='border-border/50 mt-auto flex items-center justify-between border-t pt-4'>
          <span className='text-primary text-2xl font-bold'>${item.price}</span>

          <button
            onClick={() => onAddToCart && onAddToCart(item)}
            className='bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-semibold shadow-sm transition-all hover:brightness-110 active:scale-95'
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemCard

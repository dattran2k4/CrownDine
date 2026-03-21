import { useFavoriteStore } from '@/stores/useFavoriteStore'
import ItemCard from '@/components/MenuSection/ItemCard/ItemCard'
import { Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { comboToCardItem } from '@/types/item.type'

const ProfileFavorites = () => {
  const { favorites, isLoading } = useFavoriteStore()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent'></div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className='bg-card border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center shadow-sm'>
        <div className='bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full'>
          <Heart className='text-primary h-10 w-10' />
        </div>
        <h3 className='mb-2 text-2xl font-bold'>Chưa có món yêu thích nào</h3>
        <p className='text-muted-foreground mx-auto max-w-sm px-4'>
          Hãy khám phá thực đơn của chúng tôi và lưu lại những món bạn yêu thích để dễ dàng đặt lại lần sau.
        </p>
        <Link
          to='/menu'
          className='bg-primary text-primary-foreground hover:bg-primary/90 mt-8 rounded-full px-8 py-3 font-semibold transition-all'
        >
          Khám phá Menu
        </Link>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='mb-2 text-2xl font-bold'>Danh sách yêu thích</h2>
        <p className='text-muted-foreground'>Lưu trữ những món ăn và combo bạn yêu thích nhất tại CrownDine.</p>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {favorites.map((fav) => {
          const isCombo = !!fav.combo
          const itemData = isCombo ? comboToCardItem(fav.combo!) : fav.item
          if (!itemData) return null

          return (
            <ItemCard
              key={fav.id}
              item={itemData}
              isCombo={isCombo}
              onViewDetails={(item) => navigate(`/menu/${isCombo ? 'combo' : 'item'}/${item.id}`)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProfileFavorites

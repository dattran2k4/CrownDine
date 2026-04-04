import comboApi from '@/apis/combo.api'
import categoryApi from '@/apis/category.api'
import itemApi from '@/apis/item.api'
import favoritesApi from '@/apis/favorites.api'
import type { Category } from '@/types/category.type'
import type { Item } from '@/types/item.type'
import { comboToCardItem, type MenuCardItem } from '@/types/item.type'
import type { Combo } from '@/types/combo.type'
import { formatCurrency, getImageUrl } from '@/utils/utils'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Search, Heart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/useAuthStore'

interface MenuSelectorProps {
  onSelectItem: (item: MenuCardItem, type: 'item' | 'combo') => void
}

export default function MenuSelector({ onSelectItem }: MenuSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const { isAuthenticated } = useAuthStore()

  // --- Fetching Data ---
  const { data: categoryData, isPending: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories()
  })

  const { data: itemData, isPending: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemApi.getItems()
  })

  const { data: comboData, isPending: combosLoading } = useQuery({
    queryKey: ['combos'],
    queryFn: () => comboApi.getCombos()
  })

  const { data: favoriteData, isPending: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getMyFavorites(),
    enabled: isAuthenticated
  })

  const categories: Category[] = categoryData?.data?.data ?? []
  const rawItems: Item[] = itemData?.data?.data ?? []
  const combos: Combo[] = comboData?.data?.data ?? []
  const favorites = favoriteData?.data?.data ?? []

  const categoryMap = useMemo(() => {
    const map: Record<number, string> = {}
    categories.forEach((c) => {
      map[c.id] = c.name
    })
    return map
  }, [categories])

  const itemsWithCategory: Item[] = useMemo(
    () =>
      rawItems.map((item) => ({
        ...item,
        category: categoryMap[item.categoryId] ?? ''
      })),
    [rawItems, categoryMap]
  )

  const combosAsCardItems: MenuCardItem[] = useMemo(() => combos.map(comboToCardItem), [combos])

  const categoryNames = useMemo(() => {
    const names = ['Tất cả', 'Combo']
    if (isAuthenticated) {
      names.push('Yêu thích')
    }
    return [...names, ...categories.map((c) => c.name)]
  }, [categories, isAuthenticated])

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return itemsWithCategory.filter((item) => {
      let matchCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory
      
      if (selectedCategory === 'Yêu thích') {
        matchCategory = favorites.some(f => f.item?.id === item.id)
      }

      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [itemsWithCategory, searchQuery, selectedCategory, favorites])

  const filteredCombos = useMemo(() => {
    return combosAsCardItems.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      let matchCategory = selectedCategory === 'Tất cả' || selectedCategory === 'Combo'
      if (selectedCategory === 'Yêu thích') {
        matchCategory = favorites.some(f => f.combo?.id === c.id)
      }

      return matchCategory && matchSearch
    })
  }, [combosAsCardItems, searchQuery, selectedCategory, favorites])

  const displayList = useMemo(() => {
    if (selectedCategory === 'Combo') {
      return filteredCombos.map((item) => ({ key: `combo-${item.id}`, item, type: 'combo' as const }))
    }
    if (selectedCategory === 'Tất cả' || selectedCategory === 'Yêu thích') {
      return [
        ...filteredCombos.map((item) => ({ key: `combo-${item.id}`, item, type: 'combo' as const })),
        ...filteredItems.map((item) => ({ key: `item-${item.id}`, item, type: 'item' as const }))
      ]
    }
    return filteredItems.map((item) => ({ key: `item-${item.id}`, item, type: 'item' as const }))
  }, [selectedCategory, filteredItems, filteredCombos])

  if (categoriesLoading || itemsLoading || combosLoading || (isAuthenticated && favoritesLoading)) {
    return (
      <div className='flex h-[400px] w-full items-center justify-center'>
        <p className='text-muted-foreground animate-pulse text-sm font-medium'>Đang tải thực đơn...</p>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      {/* Search Input */}
      <div className='mb-4 relative'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder='Tìm món hoặc combo...'
          className='bg-background pl-9 shadow-sm'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs (Horizontal Scroll) */}
      <div className='mb-4'>
        <div className='w-full overflow-x-auto scrollbar-hide'>
          <div className='flex w-max gap-2 pb-2'>
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted text-foreground border-border'
                }`}
              >
                {cat === 'Yêu thích' && <Heart size={12} className={selectedCategory === cat ? 'fill-current' : 'text-red-500'} />}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Menu */}
      <div className='flex-1 overflow-y-auto pr-2'>
        {displayList.length > 0 ? (
          <div className='grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 md:grid-cols-4'>
            {displayList.map(({ key, item, type }) => (
              <MenuCard 
                key={key} 
                item={item} 
                onClick={() => onSelectItem(item, type)} 
              />
            ))}
          </div>
        ) : (
          <div className='flex h-40 flex-col items-center justify-center text-center'>
            <p className='text-muted-foreground text-sm font-medium'>Không tìm thấy món ăn nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Internal Small Card Component ---
function MenuCard({ item, onClick }: { item: MenuCardItem; onClick: () => void }) {
  const currentPrice = item.priceAfterDiscount ?? item.price

  return (
    <div
      onClick={onClick}
      className='bg-card hover:border-primary cursor-pointer overflow-hidden rounded-xl border transition-all hover:shadow-md'
    >
      <div className='aspect-square overflow-hidden bg-muted relative'>
        <img 
          src={getImageUrl(item.imageUrl)} 
          alt={item.name} 
          className='h-full w-full object-cover transition-transform duration-300 hover:scale-110'
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/placeholder-food.png' // Fallback image if any
          }}
        />
        {item.status === 'SOLD_OUT' && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <span className='rounded bg-destructive px-2 py-1 text-xs font-bold text-white uppercase tracking-wider'>Hết món</span>
          </div>
        )}
      </div>
      <div className='p-3 text-center'>
        <h3 className='text-foreground line-clamp-1 mb-1 text-sm font-bold'>{item.name}</h3>
        <div className='bg-primary/10 text-primary mx-auto inline-block rounded-md px-2 py-1 text-xs font-semibold'>
          {formatCurrency(Number(currentPrice))}
        </div>
      </div>
    </div>
  )
}

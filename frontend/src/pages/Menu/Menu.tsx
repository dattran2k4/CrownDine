import comboApi from '@/apis/combo.api'
import categoryApi from '@/apis/category.api'
import itemApi from '@/apis/item.api'
import MenuFilter from '@/components/MenuFilter'
import ItemCard from '@/components/MenuSection/ItemCard'
import type { Category } from '@/types/category.type'
import type { Item } from '@/types/item.type'
import { comboToCardItem, type MenuCardItem } from '@/types/item.type'
import type { Combo } from '@/types/combo.type'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Menu() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]) // VND

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

  const categories: Category[] = categoryData?.data?.data ?? []
  const rawItems: Item[] = itemData?.data?.data ?? []
  const combos: Combo[] = comboData?.data?.data ?? []

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

  const combosAsCardItems: MenuCardItem[] = useMemo(
    () => combos.map(comboToCardItem),
    [combos]
  )

  const categoryNames = useMemo(() => ['All', ...categories.map((c) => c.name), 'Combo'], [categories])

  const filteredItems = useMemo(() => {
    return itemsWithCategory.filter((item) => {
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const currentPrice = Number(item.priceAfterDiscount ?? item.price)
      const matchPrice =
        currentPrice >= priceRange[0] && (priceRange[1] === 0 || priceRange[1] >= 10000000 || currentPrice <= priceRange[1])
      return matchCategory && matchSearch && matchPrice
    })
  }, [itemsWithCategory, searchQuery, selectedCategory, priceRange])

  const filteredCombos = useMemo(() => {
    return combosAsCardItems.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
      const currentPrice = Number(c.priceAfterDiscount ?? c.price)
      const matchPrice =
        currentPrice >= priceRange[0] && (priceRange[1] === 0 || priceRange[1] >= 10000000 || currentPrice <= priceRange[1])
      return matchSearch && matchPrice
    })
  }, [combosAsCardItems, searchQuery, priceRange])

  const navigate = useNavigate()
  const handleViewDetails = (item: MenuCardItem, type: 'item' | 'combo') => {
    navigate(`/menu/${type}/${item.id}`)
  }

  const displayList = useMemo(() => {
    if (selectedCategory === 'Combo') {
      return filteredCombos.map((item) => ({ key: `combo-${item.id}`, item }))
    }
    if (selectedCategory === 'All') {
      return [
        ...filteredItems.map((item) => ({ key: `item-${item.id}`, item })),
        ...filteredCombos.map((item) => ({ key: `combo-${item.id}`, item }))
      ]
    }
    return filteredItems.map((item) => ({ key: `item-${item.id}`, item }))
  }, [selectedCategory, filteredItems, filteredCombos])

  if (categoriesLoading || itemsLoading || combosLoading) {
    return (
      <div className='bg-background text-foreground flex min-h-screen items-center justify-center px-4'>
        <p className='text-muted-foreground'>Đang tải menu...</p>
      </div>
    )
  }

  return (
    <div className='bg-background text-foreground min-h-screen px-4 pt-10 pb-20 md:px-8'>
      {/* Header Page */}
      <div className='mx-auto mb-10 max-w-7xl text-center'>
        <p className='text-primary mb-2 text-sm font-bold tracking-widest uppercase'>• Order Now</p>
        <h1 className='mb-4 text-4xl font-bold md:text-5xl'>Discover Our Menu</h1>
        <p className='text-muted-foreground mx-auto max-w-2xl'>
          Explore our wide range of delicious dishes, from fresh starters to exquisite main courses.
        </p>
      </div>

      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-4'>
        {/* --- LEFT COLUMN: FILTER --- */}
        <div className='hidden lg:col-span-1 lg:block'>
          <MenuFilter
            categories={categoryNames}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            priceRange={priceRange}
            onPriceChange={(min, max) => setPriceRange([min, max])}
          />
        </div>

        {/* Mobile Filter Toggle (Optional - Có thể thêm nút bấm để mở modal filter trên mobile) */}
        <div className='mb-6 lg:hidden'>
          {/* Tạm thời hiển thị ô search đơn giản trên mobile */}
          <input
            type='text'
            placeholder='Search food...'
            className='border-border bg-card w-full rounded-lg border p-3'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* List category ngang cho mobile */}
          <div className='scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-2'>
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap ${selectedCategory === cat ? 'bg-primary border-primary text-white' : 'bg-card border-border'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- RIGHT COLUMN: GRID ITEMS + COMBOS --- */}
        <div className='lg:col-span-3'>
          <div className='mb-6 flex items-center justify-between'>
            <p className='text-muted-foreground'>Showing {displayList.length} results</p>

            <select
              className='bg-card border-border focus:border-primary cursor-pointer rounded-lg border px-3 py-2 text-sm outline-none'
              onChange={(e) => console.log(e.target.value)} // Xử lý sort logic sau
            >
              <option value='default'>Sort by: Recommended</option>
              <option value='price_asc'>Price: Low to High</option>
              <option value='price_desc'>Price: High to Low</option>
              <option value='rating'>Top Rated</option>
              <option value='sold'>Best Sellers</option>
            </select>
          </div>
          {displayList.length > 0 ? (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
              {displayList.map(({ key, item }) => (
                <ItemCard
                  key={key}
                  item={item}
                  isCombo={key.startsWith('combo')}
                  onViewDetails={(i) => handleViewDetails(i, key.startsWith('combo') ? 'combo' : 'item')}
                />
              ))}
            </div>
          ) : (
            // Empty State
            <div className='bg-card/50 border-border rounded-xl border border-dashed py-20 text-center'>
              <p className='text-muted-foreground text-xl font-bold'>No items found</p>
              <p className='text-muted-foreground mt-2 text-sm'>Try adjusting your filters or search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                  setPriceRange([0, 0])
                }}
                className='text-primary mt-4 font-bold hover:underline'
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

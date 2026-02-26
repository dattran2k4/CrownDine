import comboApi from '@/apis/combo.api'
import categoryApi from '@/apis/category.api'
import itemApi from '@/apis/item.api'
import { Button } from '@/components/ui/button'
import ItemCard from '@/components/MenuSection/ItemCard/ItemCard'
import type { Item } from '@/types/item.type'
import { comboToCardItem, type MenuCardItem } from '@/types/item.type'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_ITEMS_PER_ROW = 8

const MenuSection = () => {
  const [activeTab, setActiveTab] = useState('All')

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

  const categories = categoryData?.data?.data ?? []
  const rawItems: Item[] = itemData?.data?.data ?? []
  const combosAsCardItems: MenuCardItem[] = useMemo(
    () => (comboData?.data?.data ?? []).map(comboToCardItem),
    [comboData?.data?.data]
  )

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

  const categoryNames = useMemo(() => ['All', ...categories.map((c) => c.name), 'Combo'], [categories])

  const navigate = useNavigate()
  const handleViewDetails = (item: MenuCardItem, type: 'item' | 'combo') => {
    navigate(`/menu/${type}/${item.id}`)
  }

  const displayListWithKeys = useMemo(() => {
    if (activeTab === 'Combo') {
      return combosAsCardItems.map((item) => ({ key: `combo-${item.id}`, item }))
    }
    if (activeTab === 'All') {
      return [
        ...itemsWithCategory.map((item) => ({ key: `item-${item.id}`, item })),
        ...combosAsCardItems.map((item) => ({ key: `combo-${item.id}`, item }))
      ]
    }
    const filtered = itemsWithCategory.filter((item) => item.category === activeTab)
    return filtered.map((item) => ({ key: `item-${item.id}`, item }))
  }, [activeTab, itemsWithCategory, combosAsCardItems])

  return (
    <section id='menu' className='min-h-screen w-full bg-transparent px-4 py-16 md:px-8'>
      <div className='mx-auto max-w-7xl'>
        <p className='text-primary mb-2 text-center text-sm font-bold tracking-widest uppercase'>• Our Menu</p>
        {/* --- Header --- */}
        <div className='mb-12 space-y-4 text-center'>
          <h2 className='text-foreground text-4xl font-bold tracking-tight md:text-5xl'>
            Seasonal Ingredients, <br />
            <span className='text-primary'>Timeless Techniques</span>
          </h2>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed'>
            Discover the finest flavors crafted with passion. Fresh ingredients, timeless recipes, and an unforgettable
            dining experience.
          </p>
        </div>

        {/* --- Filter Tabs --- */}
        <div className='mb-12 flex flex-wrap justify-center gap-3'>
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`rounded-lg border px-6 py-2 font-medium transition-all duration-200 ${
                activeTab === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-white/50'
              } `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- Product Grid --- */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {(categoriesLoading || itemsLoading || combosLoading
            ? []
            : displayListWithKeys.slice(0, MAX_ITEMS_PER_ROW)
          ).map(({ key, item }) => (
            <ItemCard
              key={key}
              item={item}
              onViewDetails={(i) => handleViewDetails(i, key.startsWith('combo') ? 'combo' : 'item')}
            />
          ))}
        </div>
        {(categoriesLoading || itemsLoading || combosLoading) && (
          <p className='text-muted-foreground py-8 text-center text-sm'>Đang tải menu...</p>
        )}
        <div className='mt-12 flex justify-center'>
          <a href='/menu'>
            <Button
              variant='outline'
              className='border-primary text-primary hover:bg-primary hover:text-primary-foreground btn-lift cursor-pointer rounded-full border-2 bg-transparent px-8 py-6 text-lg font-semibold transition-all duration-300'
            >
              View Full Menu →
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}

export default MenuSection

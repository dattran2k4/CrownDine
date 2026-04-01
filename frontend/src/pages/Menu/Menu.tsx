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
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 12
export default function Menu() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All'])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]) // Will be updated by useEffect
  const [sortBy, setSortBy] = useState('default')

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
      const matchCategory =
        selectedCategories.includes('All') || (item.category && selectedCategories.includes(item.category))
      const matchSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const currentPrice = Number(item.priceAfterDiscount ?? item.price)
      const matchPrice =
        currentPrice >= priceRange[0] && (priceRange[1] === 0 || priceRange[1] >= 10000000 || currentPrice <= priceRange[1])
      return matchCategory && matchSearch && matchPrice
    })
  }, [itemsWithCategory, searchQuery, selectedCategories, priceRange])

  const maxPrice = useMemo(() => {
    const itemPrices = rawItems.map((item) => Number(item.priceAfterDiscount ?? item.price))
    const comboPrices = combosAsCardItems.map((combo) => Number(combo.priceAfterDiscount ?? combo.price))
    const allPrices = [...itemPrices, ...comboPrices]
    return allPrices.length > 0 ? Math.max(...allPrices) : 1000000 // Default if none
  }, [rawItems, combosAsCardItems])

  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === 10000000) {
      setPriceRange([0, maxPrice])
    }
  }, [maxPrice, priceRange])

  const filteredCombos = useMemo(() => {
    return combosAsCardItems.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())

      let matchCategory = selectedCategories.includes('All') || selectedCategories.includes('Combo')

      const currentPrice = Number(c.priceAfterDiscount ?? c.price)
      const matchPrice =
        currentPrice >= priceRange[0] && (priceRange[1] === 0 || priceRange[1] >= 10000000 || currentPrice <= priceRange[1])
      return matchSearch && matchPrice && matchCategory
    })
  }, [combosAsCardItems, searchQuery, priceRange, selectedCategories])

  const navigate = useNavigate()
  const handleViewDetails = (item: MenuCardItem, type: 'item' | 'combo') => {
    navigate(`/menu/${type}/${item.id}`)
  }

  const displayList = useMemo(() => {
    let list: { key: string; item: MenuCardItem }[] = []

    // 1. Combine items and combos based on selected categories
    list = [
      ...filteredItems.map((item) => ({ key: `item-${item.id}`, item })),
      ...filteredCombos.map((item) => ({ key: `combo-${item.id}`, item }))
    ]

    // 2. Sorting
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => {
          const priceA = Number(a.item.priceAfterDiscount ?? a.item.price)
          const priceB = Number(b.item.priceAfterDiscount ?? b.item.price)
          return priceA - priceB
        })
        break
      case 'price_desc':
        list.sort((a, b) => {
          const priceA = Number(a.item.priceAfterDiscount ?? a.item.price)
          const priceB = Number(b.item.priceAfterDiscount ?? b.item.price)
          return priceB - priceA
        })
        break
      case 'rating':
        list.sort((a, b) => (b.item.averageRating || 0) - (a.item.averageRating || 0))
        break
      case 'sold':
        list.sort((a, b) => ((b.item as any).soldCount || 0) - ((a.item as any).soldCount || 0))
        break
      default:
        list.sort((a, b) => {
          const scoreA = (a.item.tags?.includes('BEST_SELLER') ? 2 : 0) + (a.item.tags?.includes('NEW') ? 1 : 0)
          const scoreB = (b.item.tags?.includes('BEST_SELLER') ? 2 : 0) + (b.item.tags?.includes('NEW') ? 1 : 0)
          return scoreB - scoreA
        })
        break
    }

    return list
  }, [filteredItems, filteredCombos, selectedCategories, sortBy])

  const totalPages = Math.ceil(displayList.length / ITEMS_PER_PAGE)
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return displayList.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [displayList, currentPage])

  // Reset to first page when filtering
  const handleCategoryChange = (cat: string) => {
    setSelectedCategories((prev) => {
      if (cat === 'All') return ['All']
      const newCats = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev.filter((c) => c !== 'All'), cat]
      return newCats.length === 0 ? ['All'] : newCats
    })
    setCurrentPage(1)
  }

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max])
    setCurrentPage(1)
  }

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
            selectedCategories={selectedCategories}
            onSelectCategory={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchQueryChange}
            priceRange={priceRange}
            onPriceChange={handlePriceRangeChange}
            maxPrice={maxPrice}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Mobile Filter */}
        <div className='mb-6 lg:hidden'>
          <input
            type='text'
            placeholder='Search food...'
            className='border-border bg-card w-full rounded-lg border p-3'
            value={searchQuery}
            onChange={handleSearchQueryChange}
          />
          <div className='scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-2'>
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap ${selectedCategories.includes(cat) ? 'bg-primary border-primary text-white' : 'bg-card border-border'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className='mt-4'>
            <select
              className='bg-card border-border focus:border-primary w-full cursor-pointer rounded-lg border px-3 py-2 text-sm outline-none'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value='default'>Sort by: Recommended</option>
              <option value='price_asc'>Price: Low to High</option>
              <option value='price_desc'>Price: High to Low</option>
              <option value='rating'>Top Rated</option>
              <option value='sold'>Best Sellers</option>
            </select>
          </div>
        </div>

        {/* --- RIGHT COLUMN: GRID ITEMS + COMBOS --- */}
        <div className='lg:col-span-3'>
          <div className='mb-6 flex items-center justify-between'>
            <p className='text-muted-foreground'>Showing {displayList.length} results</p>
          </div>
          {paginatedList.length > 0 ? (
            <>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
                {paginatedList.map(({ key, item }) => (
                  <ItemCard
                    key={key}
                    item={item}
                    isCombo={key.startsWith('combo')}
                    onViewDetails={(i) => handleViewDetails(i, key.startsWith('combo') ? 'combo' : 'item')}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-10'>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) setCurrentPage(currentPage - 1)
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(i + 1)
                            }}
                            className='cursor-pointer'
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className='bg-card/50 border-border rounded-xl border border-dashed py-20 text-center'>
              <p className='text-muted-foreground text-xl font-bold'>No items found</p>
              <p className='text-muted-foreground mt-2 text-sm'>Try adjusting your filters or search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategories(['All'])
                  setPriceRange([0, maxPrice])
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

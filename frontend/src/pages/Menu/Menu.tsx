import MenuFilter from '@/components/MenuFilter'
import ItemCard from '@/components/MenuSection/ItemCard'
import type { Item } from '@/types/item.type'
import React, { useState, useMemo } from 'react'

// --- MOCK DATA (Cập nhật theo Entity mới) ---
const MOCK_ITEMS: Item[] = [
  {
    id: 1,
    name: 'Truffle Burrata',
    description: 'Fresh burrata with black truffle, heirloom tomatoes and basil oil.',
    price: 20,
    priceAfterDiscount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800',
    status: 'AVAILABLE',
    category: 'Starters',
    soldCount: 120,
    rating: 4.8,
    tags: ['BEST_SELLER']
  },
  {
    id: 2,
    name: 'Wagyu Ribeye Steak',
    description: 'Japanese A5 Wagyu, brown butter, roasted seasonal vegetables.',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800',
    status: 'AVAILABLE',
    category: 'Mains',
    soldCount: 45,
    rating: 5.0,
    tags: ['MUST_TRY']
  },
  {
    id: 3,
    name: 'Classic Tiramisu',
    description: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa powder.',
    price: 12,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800',
    status: 'SOLD_OUT', // Test trạng thái hết hàng
    category: 'Desserts',
    soldCount: 300,
    rating: 4.9,
    tags: ['BEST_SELLER']
  },
  {
    id: 4,
    name: 'Seafood Combo',
    description: 'Lobster, shrimp, calamari platter for 2 people.',
    price: 100,
    priceAfterDiscount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800',
    status: 'AVAILABLE',
    category: 'Combos',
    soldCount: 10,
    rating: 4.2,
    tags: ['NEW']
  }
]

const CATEGORIES = ['All', 'Starters', 'Mains', 'Combos', 'Desserts', 'Drinks']

export default function Menu() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]) // Mặc định 0 - 1000$

  // Logic Filter (Xử lý client-side tạm thời)
  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
      // 1. Filter Category
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory

      // 2. Filter Search (Name)
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())

      // 3. Filter Price (Sử dụng priceAfterDiscount nếu có, không thì dùng price thường)
      const currentPrice = item.priceAfterDiscount ?? item.price
      const matchPrice = currentPrice >= priceRange[0] && (priceRange[1] === 0 || currentPrice <= priceRange[1])
      // Note: Logic priceRange[1] === 0 nghĩa là user chưa nhập max thì bỏ qua check max

      return matchCategory && matchSearch && matchPrice
    })
  }, [searchQuery, selectedCategory, priceRange])

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
            categories={CATEGORIES}
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
            {CATEGORIES.map((cat) => (
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

        {/* --- RIGHT COLUMN: GRID ITEMS --- */}
        <div className='lg:col-span-3'>
          <div className='mb-6 flex items-center justify-between'>
            <p className='text-muted-foreground'>Showing {filteredItems.length} results</p>

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
          {filteredItems.length > 0 ? (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
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

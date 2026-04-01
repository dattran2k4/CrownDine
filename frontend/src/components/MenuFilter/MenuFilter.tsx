import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'

interface MenuFilterProps {
  categories: string[]
  selectedCategories: string[]
  onSelectCategory: (cat: string) => void
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  priceRange: [number, number]
  onPriceChange: (min: number, max: number) => void
  maxPrice: number
  sortBy: string
  onSortChange: (sort: string) => void
}

const MenuFilter = ({
  categories,
  selectedCategories,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  priceRange,
  onPriceChange,
  maxPrice,
  sortBy,
  onSortChange
}: MenuFilterProps) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), priceRange[1] - 50)
    onPriceChange(value, priceRange[1])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), priceRange[0] + 50)
    onPriceChange(priceRange[0], value)
  }

  return (
    <div className='bg-card border-border sticky top-4 h-fit space-y-8 rounded-xl border p-6'>
      {/* 1. Search Box */}
      <div>
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold'>
          <Search size={20} className='text-primary' /> Tìm kiếm
        </h3>
        <div className='relative'>
          <input
            type='text'
            placeholder='Tìm tên món ăn...'
            value={searchQuery}
            onChange={onSearchChange}
            className='bg-input border-border focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pr-4 pl-10 transition-all outline-none focus:ring-1'
          />
          <Search className='text-muted-foreground absolute top-2.5 left-3' size={16} />
        </div>
      </div>

      {/* 2. Sorting */}
      <div>
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold'>
          <ArrowUpDown size={20} className='text-primary' /> Sắp xếp
        </h3>
        <select
          className='bg-input border-border focus:border-primary cursor-pointer w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-primary'
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value='default'>Đề xuất</option>
          <option value='price_asc'>Giá: Thấp đến Cao</option>
          <option value='price_desc'>Giá: Cao đến Thấp</option>
          <option value='rating'>Đánh giá cao</option>
          <option value='sold'>Bán chạy nhất</option>
        </select>
      </div>

      {/* 3. Categories */}
      <div>
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold'>
          <SlidersHorizontal size={20} className='text-primary' /> Danh mục
        </h3>
        <div className='space-y-2'>
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat)
            return (
              <label key={cat} className='group flex cursor-pointer items-center gap-3'>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${isSelected ? 'bg-primary border-primary' : 'group-hover:border-primary border-gray-400 bg-white'} `}
                >
                  {isSelected && (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='white'
                      strokeWidth='4'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <polyline points='20 6 9 17 4 12' />
                    </svg>
                  )}
                </div>
                <input
                  type='checkbox'
                  className='hidden'
                  checked={isSelected}
                  onChange={() => onSelectCategory(cat)}
                />
                <span
                  className={`${isSelected ? 'text-primary font-bold' : 'text-foreground group-hover:text-primary'} transition-colors`}
                >
                  {cat}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* 4. Price Filter (Improved Double Range Slider) */}
      <div>
        <h3 className='mb-6 text-lg font-bold'>Khoảng giá</h3>
        <div className='relative h-6 w-full'>
          {/* Custom Track */}
          <div className='absolute top-2 left-0 h-1.5 w-full rounded-full bg-gray-200'></div>
          <div
            className='absolute top-2 h-1.5 rounded-full bg-primary'
            style={{
              left: `${(priceRange[0] / maxPrice) * 100}%`,
              width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`
            }}
          ></div>
          
          {/* Min Input */}
          <input
            type='range'
            min={0}
            max={maxPrice}
            step={25000}
            value={priceRange[0]}
            onChange={handleMinChange}
            className='pointer-events-none absolute top-1.5 left-0 h-2 w-full appearance-none bg-transparent outline-none ring-0 focus:ring-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md'
          />
          {/* Max Input */}
          <input
            type='range'
            min={0}
            max={maxPrice}
            step={25000}
            value={priceRange[1]}
            onChange={handleMaxChange}
            className='pointer-events-none absolute top-1.5 left-0 h-2 w-full appearance-none bg-transparent outline-none ring-0 focus:ring-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md'
           style={{ zIndex: priceRange[1] > maxPrice * 0.9 ? 5 : 4 }}
          />
        </div>

        <div className='mt-6 flex items-center justify-between text-[10px] sm:text-xs text-gray-500'>
           <div className='bg-primary/10 rounded px-2 py-1 font-bold text-primary shadow-sm'>
              {formatCurrency(priceRange[0])}
           </div>
           <span className='font-bold opacity-30'>-</span>
           <div className='bg-primary/10 rounded px-2 py-1 font-bold text-primary shadow-sm'>
              {formatCurrency(priceRange[1])}
           </div>
        </div>
      </div>
    </div>
  )
}

export default MenuFilter

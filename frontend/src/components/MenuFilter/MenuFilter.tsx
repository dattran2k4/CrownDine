import { Search, SlidersHorizontal } from 'lucide-react'

interface MenuFilterProps {
  categories: string[]
  selectedCategories: string[]
  onSelectCategory: (cat: string) => void
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  priceRange: [number, number]
  onPriceChange: (min: number, max: number) => void
  maxPrice: number
}

const MenuFilter = ({
  categories,
  selectedCategories,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  priceRange,
  onPriceChange,
  maxPrice
}: MenuFilterProps) => {
  const currentMax = priceRange[1] === 10000000 || priceRange[1] === 0 ? maxPrice : priceRange[1]

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  return (
    <div className='bg-card border-border sticky top-4 h-fit space-y-8 rounded-xl border p-6'>
      {/* 1. Search Box */}
      <div>
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold'>
          <Search size={20} className='text-primary' /> Search
        </h3>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search food name...'
            value={searchQuery}
            onChange={onSearchChange}
            className='bg-input border-border focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pr-4 pl-10 transition-all outline-none focus:ring-1'
          />
          <Search className='text-muted-foreground absolute top-2.5 left-3' size={16} />
        </div>
      </div>

      {/* 2. Categories */}
      <div>
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold'>
          <SlidersHorizontal size={20} className='text-primary' /> Categories
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

      {/* 3. Price Filter (Slider) */}
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-bold'>Price Range</h3>
          <span className='text-primary text-xs font-semibold'>{formatCurrency(currentMax)}</span>
        </div>
        <div className='space-y-4'>
          <input
            type='range'
            min={0}
            max={maxPrice}
            step={1000}
            value={currentMax}
            onChange={(e) => onPriceChange(0, Number(e.target.value))}
            className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary'
          />
          <div className='flex justify-between text-[10px] text-gray-500'>
            <span>0đ</span>
            <span>{formatCurrency(maxPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuFilter

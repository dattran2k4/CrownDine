import { Search, SlidersHorizontal } from 'lucide-react'

interface MenuFilterProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (cat: string) => void
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  priceRange: [number, number]
  onPriceChange: (min: number, max: number) => void
}

const MenuFilter = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  priceRange,
  onPriceChange
}: MenuFilterProps) => {
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
          {categories.map((cat) => (
            <label key={cat} className='group flex cursor-pointer items-center gap-3'>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${selectedCategory === cat ? 'bg-primary border-primary' : 'group-hover:border-primary border-gray-400 bg-white'} `}
              >
                {selectedCategory === cat && <div className='h-2 w-2 rounded-full bg-white' />}
              </div>
              <input
                type='radio'
                name='category'
                className='hidden'
                checked={selectedCategory === cat}
                onChange={() => onSelectCategory(cat)}
              />
              <span
                className={`${selectedCategory === cat ? 'text-primary font-bold' : 'text-foreground group-hover:text-primary'} transition-colors`}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Price Filter (Simple Inputs) */}
      <div>
        <h3 className='mb-4 text-lg font-bold'>Price Range</h3>
        <div className='flex items-center gap-2'>
          <input
            type='number'
            placeholder='Min'
            className='bg-input border-border focus:border-primary w-full rounded border px-3 py-2 text-sm outline-none'
            onChange={(e) => onPriceChange(Number(e.target.value), priceRange[1])}
          />
          <span className='text-muted-foreground'>-</span>
          <input
            type='number'
            placeholder='Max'
            className='bg-input border-border focus:border-primary w-full rounded border px-3 py-2 text-sm outline-none'
            onChange={(e) => onPriceChange(priceRange[0], Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}

export default MenuFilter

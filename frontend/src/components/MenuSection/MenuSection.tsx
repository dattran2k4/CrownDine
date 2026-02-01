import { useState } from 'react'
import ItemCard from '@/components/MenuSection/ItemCard/ItemCard'
import type { Item } from '@/types/item.type'
import { Button } from '../ui/button'

const MOCK_MENU: Item[] = [
  {
    id: 1,
    name: 'Truffle Burrata',
    description: 'Fresh burrata with black truffle, heirloom tomatoes',
    price: 18,
    status: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop', // Ảnh minh họa
    category: 'Starters'
  },
  {
    id: 2,
    name: 'Tuna Tartare',
    description: 'Yellowfin tuna, avocado, lemon, crispy wontons',
    price: 22,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 5,
    category: 'Starters'
  },
  {
    id: 3,
    name: 'Wagyu Ribeye',
    description: 'Japanese Wagyu, brown butter, roasted vegetables',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 5,
    category: 'Mains'
  },
  {
    id: 4,
    name: 'Lobster Risotto',
    description: 'Maine lobster, saffron arborio, parmesan foam',
    price: 48,
    imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 4,
    category: 'Mains'
  },
  {
    id: 5,
    name: 'Truffle Burrata',
    description: 'Fresh burrata with black truffle, heirloom tomatoes',
    price: 18,
    imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop', // Ảnh minh họa
    status: 'AVAILABLE',
    rating: 5,
    category: 'Starters'
  },
  {
    id: 6,
    name: 'Tuna Tartare',
    description: 'Yellowfin tuna, avocado, lemon, crispy wontons',
    price: 22,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 5,
    category: 'Starters'
  },
  {
    id: 7,
    name: 'Wagyu Ribeye',
    description: 'Japanese Wagyu, brown butter, roasted vegetables',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 5,
    category: 'Mains'
  },
  {
    id: 8,
    name: 'Lobster Risotto',
    description: 'Maine lobster, saffron arborio, parmesan foam',
    price: 48,
    imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 4,
    category: 'Mains'
  },
  {
    id: 9,
    name: 'Truffle Burrata',
    description: 'Fresh burrata with black truffle, heirloom tomatoes',
    price: 18,
    imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop', // Ảnh minh họa
    status: 'AVAILABLE',
    rating: 5,
    category: 'Starters'
  },
  {
    id: 10,
    name: 'Tuna Tartare',
    description: 'Yellowfin tuna, avocado, lemon, crispy wontons',
    price: 22,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 5,
    category: 'Starters'
  },
  {
    id: 11,
    name: 'Wagyu Ribeye',
    description: 'Japanese Wagyu, brown butter, roasted vegetables',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 5,
    category: 'Mains'
  },
  {
    id: 12,
    name: 'Lobster Risotto',
    description: 'Maine lobster, saffron arborio, parmesan foam',
    price: 48,
    imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop',
    status: 'AVAILABLE',
    rating: 4,
    category: 'Mains'
  }
]

const CATEGORIES = ['All', 'Starters', 'Mains', 'Combos', 'Desserts']

const MAX_ITEMS_PER_ROW = 4

const MenuSection = () => {
  const [activeTab, setActiveTab] = useState('All')

  const handleAddToCart = (item: Item) => {
    console.log('Add to cart:', item.name)
    // Gọi React Query
  }

  const filteredMenu = activeTab === 'All' ? MOCK_MENU : MOCK_MENU.filter((item) => item.category === activeTab)

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
          {CATEGORIES.map((cat) => (
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
          {filteredMenu.slice(0, MAX_ITEMS_PER_ROW).map((item) => (
            <ItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
          ))}
        </div>
        <div className='mt-12 flex justify-center'>
          <a href='#menu'>
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

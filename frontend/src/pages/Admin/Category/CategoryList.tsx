import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { CategoryForm } from '@/components/form/category-form'
import { MenuItemForm, type ItemFormData } from '@/components/form/menu-item-form'
import { CategoryToolbar } from './components/CategoryToolbar'
import { CategoryTable } from './components/CategoryTable'
import { ItemsModal } from './components/ItemsModal'

// Mock Data
const MOCK_CATEGORIES = [
  {
    id: 1,
    name: 'Starters',
    description: 'Appetizers and small plates.',
    itemsCount: 12
  },
  {
    id: 2,
    name: 'Mains',
    description: 'Hearty main courses.',
    itemsCount: 24
  },
  {
    id: 3,
    name: 'Desserts',
    description: 'Sweet treats.',
    itemsCount: 8
  },
  {
    id: 4,
    name: 'Drinks',
    description: 'Beverages.',
    itemsCount: 15
  },
  {
    id: 5,
    name: 'Seasonal',
    description: 'Limited time offers.',
    itemsCount: 3
  }
]

const MOCK_ITEMS = [
  {
    id: 101,
    name: 'Garlic Bread',
    description: 'Toasted baguette with garlic butter.',
    price: 5,
    status: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1573140247632-f84660f67126?q=80&w=150',
    categoryId: 1
  },
  {
    id: 102,
    name: 'Bruschetta',
    description: 'Tomato and basil on toast.',
    price: 8,
    status: 'sold_out',
    image: 'https://images.unsplash.com/photo-1572695157369-a0eac271ad93?q=80&w=150',
    categoryId: 1
  },
  {
    id: 201,
    name: 'Ribeye Steak',
    description: 'Grilled ribeye with herbs.',
    price: 35,
    status: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=150',
    categoryId: 2
  }
]

interface Category {
  id: number
  name: string
  description: string
  itemsCount: number
}

interface Item {
  id: number
  name: string
  description: string
  price: number
  status: string
  image: string
  categoryId: number
}

export default function CategoryList() {
  const [searchTerm, setSearchTerm] = useState('')

  // Create/Edit Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // View Items State
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false)
  const [selectedCategoryForItems, setSelectedCategoryForItems] = useState<Category | null>(null)
  const [categoryItems, setCategoryItems] = useState<Item[]>([])

  // Item Create/Edit State
  const [isItemFormOpen, setIsItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  // --- HANDLERS FOR CATEGORY ---

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleEditCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation() // Prevent row click
    setEditingCategory(category)
    setIsCategoryModalOpen(true)
  }

  const handleDeleteCategory = (e: React.MouseEvent, category: Category) => {
      e.stopPropagation()
      console.log('Delete category', category)
  }

  const handleSaveCategory = (data: { name: string; description: string }) => {
    console.log('Saved Category:', data)
    setIsCategoryModalOpen(false)
  }

  // --- HANDLERS FOR ITEMS ---

  const handleRowClick = (category: Category) => {
    setSelectedCategoryForItems(category)
    const items = MOCK_ITEMS.filter(() => true) // In real app, filter by categoryId
    setCategoryItems(items)
    setIsItemsModalOpen(true)
  }

  const handleCreateItem = () => {
    setEditingItem(null)
    setIsItemFormOpen(true)
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setIsItemFormOpen(true)
  }

  const handleDeleteItem = (item: Item) => {
      console.log('Delete item', item)
  }

  const handleSaveItem = (data: ItemFormData) => {
    console.log('Saved Item:', data)
    setIsItemFormOpen(false)
  }

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Categories</h1>
          <p className='text-muted-foreground mt-1'>Manage your menu categories.</p>
        </div>
        <button
          onClick={handleCreateCategory}
          className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Category
        </button>
      </div>

      {/* Filters & Toolbar */}
      <CategoryToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Table */}
      <CategoryTable 
        categories={MOCK_CATEGORIES} 
        onRowClick={handleRowClick}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <CategoryForm
          key={editingCategory ? editingCategory.id : 'new-category'}
          initialData={editingCategory}
          onSubmit={handleSaveCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
        />
      </Modal>

      {/* Items List Modal (Width Large) */}
      <ItemsModal 
        isOpen={isItemsModalOpen}
        onClose={() => setIsItemsModalOpen(false)}
        categoryName={selectedCategoryForItems?.name}
        items={categoryItems}
        onAddItem={handleCreateItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Item Create/Edit Modal */}
      <Modal
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <MenuItemForm
          key={editingItem ? editingItem.id : 'new-item'}
          initialData={editingItem}
          onSubmit={handleSaveItem}
          onCancel={() => setIsItemFormOpen(false)}
        />
      </Modal>
    </div>
  )
}

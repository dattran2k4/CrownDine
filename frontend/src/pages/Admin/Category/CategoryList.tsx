import React, { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Filter, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { CategoryForm } from '@/components/form/category-form'
import { MenuItemForm, type ItemFormData } from '@/components/form/menu-item-form'

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

  const handleSaveCategory = (data: { name: string; description: string }) => {
    console.log('Saved Category:', data)
    setIsCategoryModalOpen(false)
  }

  // --- HANDLERS FOR ITEMS ---

  const handleRowClick = (category: Category) => {
    setSelectedCategoryForItems(category)
    const items = MOCK_ITEMS.filter(() => true)
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
      <div className='bg-card border-border flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm'>
        <div className='relative max-w-sm flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search categories...'
            className='bg-background pl-9'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='flex items-center gap-2'>
          <button className='border-input hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium shadow-sm transition-colors'>
            <Filter className='mr-2 h-4 w-4' />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='border-border bg-card overflow-hidden rounded-xl border shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-muted/50 text-muted-foreground border-border border-b font-medium'>
              <tr>
                <th className='min-w-[200px] px-6 py-4'>
                  <div className='hover:text-foreground flex cursor-pointer items-center gap-2'>
                    Name <ArrowUpDown className='h-3 w-3' />
                  </div>
                </th>
                <th className='hidden px-6 py-4 md:table-cell'>Description</th>
                <th className='w-[100px] px-6 py-4 text-center'>Items</th>
                <th className='w-[100px] px-6 py-4 text-end'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-border divide-y'>
              {MOCK_CATEGORIES.map((category) => (
                <tr
                  key={category.id}
                  className='group hover:bg-muted/30 cursor-pointer transition-colors'
                  onClick={() => handleRowClick(category)}
                >
                  <td className='px-6 py-4'>
                    <div className='text-base font-semibold'>{category.name}</div>
                  </td>
                  <td className='text-muted-foreground hidden px-6 py-4 md:table-cell'>{category.description}</td>
                  <td className='px-6 py-4 text-center font-medium'>{category.itemsCount}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        onClick={(e) => handleEditCategory(e, category)}
                        className='hover:bg-accent text-muted-foreground hover:text-primary rounded-md p-2 transition-colors'
                      >
                        <Pencil className='h-4 w-4' />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className='hover:bg-accent text-muted-foreground hover:text-destructive rounded-md p-2 transition-colors'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
      <Modal
        isOpen={isItemsModalOpen}
        onClose={() => setIsItemsModalOpen(false)}
        title={`Items in ${selectedCategoryForItems?.name}`}
        maxWidth='max-w-4xl'
      >
        <div className='space-y-4'>
          <div className='bg-muted/30 flex items-center justify-between rounded-lg p-2'>
            <span className='text-muted-foreground text-sm'>Showing {categoryItems.length} items</span>
            <Button size='sm' onClick={handleCreateItem}>
              <Plus className='mr-2 h-4 w-4' />
              Add Item
            </Button>
          </div>

          <div className='border-border overflow-hidden rounded-lg border'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-muted/50 text-muted-foreground border-border border-b font-medium'>
                <tr>
                  <th className='w-[60px] px-4 py-3'>Image</th>
                  <th className='px-4 py-3'>Name</th>
                  <th className='hidden px-4 py-3 sm:table-cell'>Description</th>
                  <th className='w-[100px] px-4 py-3'>Price</th>
                  <th className='w-[100px] px-4 py-3'>Status</th>
                  <th className='w-[80px] px-4 py-3 text-end'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-border divide-y'>
                {categoryItems.length > 0 ? (
                  categoryItems.map((item) => (
                    <tr key={item.id} className='hover:bg-muted/30 transition-colors'>
                      <td className='px-4 py-3'>
                        <div className='bg-muted border-border h-10 w-10 overflow-hidden rounded-md border'>
                          <img src={item.image} alt={item.name} className='h-full w-full object-cover' />
                        </div>
                      </td>
                      <td className='px-4 py-3 font-medium'>{item.name}</td>
                      <td className='text-muted-foreground hidden max-w-[200px] truncate px-4 py-3 sm:table-cell'>
                        {item.description}
                      </td>
                      <td className='px-4 py-3'>${item.price}</td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                            item.status === 'AVAILABLE'
                              ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                              : 'bg-destructive/15 text-destructive'
                          } `}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-end'>
                        <div className='flex items-center justify-end gap-1'>
                          <button
                            onClick={() => handleEditItem(item)}
                            className='hover:bg-accent text-muted-foreground hover:text-primary rounded-md p-1.5 transition-colors'
                          >
                            <Pencil className='h-3.5 w-3.5' />
                          </button>
                          <button className='hover:bg-accent text-muted-foreground hover:text-destructive rounded-md p-1.5 transition-colors'>
                            <Trash2 className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='text-muted-foreground px-4 py-8 text-center'>
                      No items found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

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

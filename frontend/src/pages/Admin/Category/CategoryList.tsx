import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { CategoryForm } from '@/components/form/category-form'
import { MenuItemForm, type ItemFormData } from '@/components/form/menu-item-form'
import { CategoryToolbar } from './components/CategoryToolbar'
import { CategoryTable } from './components/CategoryTable'
import { ItemsModal } from './components/ItemsModal'
import categoryApi from '@/apis/category.api'
import itemApi from '@/apis/item.api'
import type { Category } from '@/types/category.type'
import type { Item } from '@/types/item.type'

export default function CategoryList() {
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  // Categories query
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories()
  })

  const categories = categoriesData?.data.data || []

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created successfully')
      setIsCategoryModalOpen(false)
    }
  })

  // Update Category Mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description: string } }) =>
      categoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated successfully')
      setIsCategoryModalOpen(false)
    }
  })

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
    }
  })

  // Create/Edit Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // View Items State
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false)
  const [selectedCategoryForItems, setSelectedCategoryForItems] = useState<Category | null>(null)
  const [categoryItems, setCategoryItems] = useState<Item[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  // Item Create/Edit State
  const [isItemFormOpen, setIsItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  // --- HANDLERS FOR CATEGORY ---

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleEditCategory = (e: React.MouseEvent, category: any) => {
    e.stopPropagation() // Prevent row click
    setEditingCategory(category)
    setIsCategoryModalOpen(true)
  }

  const handleDeleteCategory = (e: React.MouseEvent, category: any) => {
      e.stopPropagation()
      if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
          deleteCategoryMutation.mutate(category.id)
      }
  }

  const handleSaveCategory = (data: { name: string; description: string }) => {
    if (editingCategory) {
        updateCategoryMutation.mutate({ id: editingCategory.id, data })
    } else {
        createCategoryMutation.mutate(data)
    }
  }

  // --- HANDLERS FOR ITEMS ---

  const handleRowClick = async (category: any) => {
    setSelectedCategoryForItems(category)
    setIsLoadingItems(true)
    setIsItemsModalOpen(true)
    try {
      const response = await itemApi.getItemsByCategory(category.id)
      setCategoryItems(response.data.data.content || [])
    } catch (error) {
      console.error('Error fetching items:', error)
      setCategoryItems([])
    } finally {
      setIsLoadingItems(false)
    }
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
      {isLoadingCategories ? (
          <div className='flex h-64 items-center justify-center'>
              <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent'></div>
          </div>
      ) : (
        <CategoryTable 
            categories={categories} 
            onRowClick={handleRowClick}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
        />
      )}

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
        isLoading={isLoadingItems}
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
          initialData={editingItem ? {
              name: editingItem.name,
              description: editingItem.description,
              image: editingItem.imageUrl,
              price: editingItem.price,
              status: editingItem.status
          } : null}
          onSubmit={handleSaveItem}
          onCancel={() => setIsItemFormOpen(false)}
        />
      </Modal>
    </div>
  )
}

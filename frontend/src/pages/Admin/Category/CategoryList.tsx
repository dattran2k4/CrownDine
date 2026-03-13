import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { CategoryForm } from '@/components/form/category-form'
import { MenuItemForm, type ItemFormData } from '@/components/form/menu-item-form'
import { ComboForm, type ComboFormData } from '@/components/form/combo-form'
import { CategoryToolbar } from './components/CategoryToolbar'
import { CategoryTable } from './components/CategoryTable'
import { ItemsModal } from './components/ItemsModal'
import categoryApi from '@/apis/category.api'
import itemApi from '@/apis/item.api'
import comboApi from '@/apis/combo.api'
import type { Category } from '@/types/category.type'
import type { Item } from '@/types/item.type'
import type { Combo } from '@/types/combo.type'
import { ComboTable } from './components/ComboTable'
import { ComboItemsModal } from './components/ComboItemsModal'

export default function CategoryList() {
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  // Categories query
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories()
  })

  const categories = (categoriesData?.data.data || []).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  // --- ITEM MUTATIONS ---

  const createItemMutation = useMutation({
    mutationFn: (data: any) => itemApi.createItem(data),
    onSuccess: () => {
      if (selectedCategoryForItems) {
        handleRowClick(selectedCategoryForItems) // Refresh item list
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Item created successfully')
      setIsItemFormOpen(false)
    }
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => itemApi.updateItem(id, data),
    onSuccess: () => {
      if (selectedCategoryForItems) {
        handleRowClick(selectedCategoryForItems) // Refresh item list
      }
      toast.success('Item updated successfully')
      setIsItemFormOpen(false)
    }
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => itemApi.deleteItem(id),
    onSuccess: () => {
      if (selectedCategoryForItems) {
        handleRowClick(selectedCategoryForItems) // Refresh item list
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Item deleted successfully')
    }
  })

  // --- COMBO MUTATIONS ---

  const { data: combosData, isLoading: isLoadingCombos } = useQuery({
    queryKey: ['combos'],
    queryFn: () => comboApi.getCombos()
  })

  const combos = (combosData?.data.data || []).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteComboMutation = useMutation({
    mutationFn: (id: number) => comboApi.deleteCombo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos'] })
      toast.success('Combo deleted successfully')
    }
  })

  // Create Combo Mutation
  const createComboMutation = useMutation({
    mutationFn: (data: ComboFormData) => comboApi.createCombo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos'] })
      toast.success('Combo created successfully')
      setIsComboModalOpen(false)
    }
  })

  // Update Combo Mutation
  const updateComboMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ComboFormData }) =>
      comboApi.updateCombo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos'] })
      toast.success('Combo updated successfully')
      setIsComboModalOpen(false)
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

  // Combo Create/Edit State
  const [isComboModalOpen, setIsComboModalOpen] = useState(false)
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null)

  // View Combo Items State
  const [isComboItemsModalOpen, setIsComboItemsModalOpen] = useState(false)
  const [selectedComboForDetails, setSelectedComboForDetails] = useState<Combo | null>(null)

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
      setCategoryItems(response.data.data.data || [])
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
    if (window.confirm(`Are you sure you want to delete item "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id)
    }
  }

  const handleComboRowClick = (combo: Combo) => {
    setSelectedComboForDetails(combo)
    setIsComboItemsModalOpen(true)
  }

  // --- HANDLERS FOR COMBOS ---

  const handleCreateCombo = () => {
    setEditingCombo(null)
    setIsComboModalOpen(true)
  }

  const handleEditCombo = (e: React.MouseEvent | null, combo: Combo) => {
    if (e) e.stopPropagation()
    setEditingCombo(combo)
    setIsComboModalOpen(true)
  }

  const handleDeleteCombo = (e: React.MouseEvent, combo: Combo) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete combo "${combo.name}"?`)) {
      deleteComboMutation.mutate(combo.id)
    }
  }

  const handleSaveCombo = (data: ComboFormData) => {
    if (editingCombo) {
      updateComboMutation.mutate({ id: editingCombo.id, data })
    } else {
      createComboMutation.mutate(data)
    }
  }

  const handleSaveItem = (data: ItemFormData) => {
    if (!selectedCategoryForItems) return

    const payload = {
      ...data,
      imageUrl: data.image, // Map image field from form to imageUrl for API
      categoryId: selectedCategoryForItems.id
    }

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: payload })
    } else {
      createItemMutation.mutate(payload)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Menu Management</h1>
          <p className='text-muted-foreground mt-1'>Manage your categories and combos.</p>
        </div>
      </div>

      {/* Filters & Toolbar */}
      <CategoryToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Categories Table */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>Categories</h2>
            <button
              onClick={handleCreateCategory}
              className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Category
            </button>
          </div>
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
        </div>

        {/* Combos Table */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>Combos</h2>
            <button
              onClick={handleCreateCombo}
              className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Combo
            </button>
          </div>
          {isLoadingCombos ? (
            <div className='flex h-64 items-center justify-center'>
              <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent'></div>
            </div>
          ) : (
            <ComboTable 
                combos={combos} 
                onRowClick={handleComboRowClick}
                onEdit={handleEditCombo} 
                onDelete={handleDeleteCombo} 
            />
          )}
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

      {/* Combo Create/Edit Modal */}
      <Modal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        title={editingCombo ? 'Edit Combo' : 'Add New Combo'}
        maxWidth='max-w-4xl'
      >
        <ComboForm
          key={editingCombo ? editingCombo.id : 'new-combo'}
          initialData={editingCombo}
          onSubmit={handleSaveCombo}
          onCancel={() => setIsComboModalOpen(false)}
        />
      </Modal>

      {/* Combo Items Detail Modal */}
      <ComboItemsModal
        isOpen={isComboItemsModalOpen}
        onClose={() => setIsComboItemsModalOpen(false)}
        combo={selectedComboForDetails}
        onEdit={(combo) => handleEditCombo(null, combo)}
      />
    </div>
  )
}

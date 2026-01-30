import React, { useState } from 'react'
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Filter,
    ArrowUpDown
} from 'lucide-react'
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
    { id: 101, name: 'Garlic Bread', description: 'Toasted baguette with garlic butter.', price: 5, status: 'AVAILABLE', image: 'https://images.unsplash.com/photo-1573140247632-f84660f67126?q=80&w=150', categoryId: 1 },
    { id: 102, name: 'Bruschetta', description: 'Tomato and basil on toast.', price: 8, status: 'sold_out', image: 'https://images.unsplash.com/photo-1572695157369-a0eac271ad93?q=80&w=150', categoryId: 1 },
    { id: 201, name: 'Ribeye Steak', description: 'Grilled ribeye with herbs.', price: 35, status: 'AVAILABLE', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=150', categoryId: 2 },
]

interface Category {
    id: number;
    name: string;
    description: string;
    itemsCount: number;
}

interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    status: string;
    image: string;
    categoryId: number;
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

    const handleSaveCategory = (data: { name: string, description: string }) => {
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
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight'>Categories</h1>
                    <p className='text-muted-foreground mt-1'>Manage your menu categories.</p>
                </div>
                <button
                    onClick={handleCreateCategory}
                    className='inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                >
                    <Plus className='mr-2 h-4 w-4' />
                    Add Category
                </button>
            </div>

            {/* Filters & Toolbar */}
            <div className='flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm'>
                <div className='relative flex-1 max-w-sm'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search categories...'
                        className='pl-9 bg-background'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className='flex items-center gap-2'>
                    <button className='inline-flex h-9 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground'>
                        <Filter className='mr-2 h-4 w-4' />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className='rounded-xl border border-border bg-card shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                        <thead className='bg-muted/50 text-muted-foreground font-medium border-b border-border'>
                            <tr>
                                <th className='px-6 py-4 min-w-[200px]'>
                                    <div className='flex items-center gap-2 cursor-pointer hover:text-foreground'>
                                        Name <ArrowUpDown className='h-3 w-3' />
                                    </div>
                                </th>
                                <th className='px-6 py-4 hidden md:table-cell'>Description</th>
                                <th className='px-6 py-4 w-[100px] text-center'>Items</th>
                                <th className='px-6 py-4 w-[100px] text-end'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-border'>
                            {MOCK_CATEGORIES.map((category) => (
                                <tr
                                    key={category.id}
                                    className='group hover:bg-muted/30 transition-colors cursor-pointer'
                                    onClick={() => handleRowClick(category)}
                                >
                                    <td className='px-6 py-4'>
                                        <div className='font-semibold text-base'>{category.name}</div>
                                    </td>
                                    <td className='px-6 py-4 hidden md:table-cell text-muted-foreground'>
                                        {category.description}
                                    </td>
                                    <td className='px-6 py-4 text-center font-medium'>
                                        {category.itemsCount}
                                    </td>
                                    <td className='px-6 py-4'>
                                        <div className='flex items-center justify-end gap-2'>
                                            <button
                                                onClick={(e) => handleEditCategory(e, category)}
                                                className='p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors'
                                            >
                                                <Pencil className='h-4 w-4' />
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className='p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-destructive transition-colors'
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
                maxWidth="max-w-4xl"
            >
                <div className="space-y-4">
                    <div className='flex justify-between items-center bg-muted/30 p-2 rounded-lg'>
                        <span className='text-sm text-muted-foreground'>Showing {categoryItems.length} items</span>
                        <Button size="sm" onClick={handleCreateItem}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>

                    <div className='rounded-lg border border-border overflow-hidden'>
                        <table className='w-full text-sm text-left'>
                            <thead className='bg-muted/50 text-muted-foreground font-medium border-b border-border'>
                                <tr>
                                    <th className='px-4 py-3 w-[60px]'>Image</th>
                                    <th className='px-4 py-3'>Name</th>
                                    <th className='px-4 py-3 hidden sm:table-cell'>Description</th>
                                    <th className='px-4 py-3 w-[100px]'>Price</th>
                                    <th className='px-4 py-3 w-[100px]'>Status</th>
                                    <th className='px-4 py-3 w-[80px] text-end'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-border'>
                                {categoryItems.length > 0 ? (
                                    categoryItems.map((item) => (
                                        <tr key={item.id} className='hover:bg-muted/30 transition-colors'>
                                            <td className='px-4 py-3'>
                                                <div className="h-10 w-10 rounded-md bg-muted overflow-hidden border border-border">
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                </div>
                                            </td>
                                            <td className='px-4 py-3 font-medium'>{item.name}</td>
                                            <td className='px-4 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]'>{item.description}</td>
                                            <td className='px-4 py-3'>${item.price}</td>
                                            <td className='px-4 py-3'>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase
                                                    ${item.status === 'AVAILABLE'
                                                        ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                                                        : 'bg-destructive/15 text-destructive'
                                                    }
                                                `}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3 text-end'>
                                                <div className='flex items-center justify-end gap-1'>
                                                    <button
                                                        onClick={() => handleEditItem(item)}
                                                        className='p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors'
                                                    >
                                                        <Pencil className='h-3.5 w-3.5' />
                                                    </button>
                                                    <button
                                                        className='p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-destructive transition-colors'
                                                    >
                                                        <Trash2 className='h-3.5 w-3.5' />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className='px-4 py-8 text-center text-muted-foreground'>
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

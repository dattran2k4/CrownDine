import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import type { Item } from '@/types/item.type'

interface ItemsModalProps {
    isOpen: boolean
    onClose: () => void
    categoryName: string | undefined
    items: Item[]
    isLoading?: boolean
    onAddItem: () => void
    onEditItem: (item: Item) => void
    onDeleteItem: (item: Item) => void
}

export function ItemsModal({ isOpen, onClose, categoryName, items, isLoading, onAddItem, onEditItem, onDeleteItem }: ItemsModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Items in ${categoryName}`}
            maxWidth='max-w-4xl'
        >
            <div className='space-y-4'>
            <div className='bg-muted/30 flex items-center justify-between rounded-lg p-2'>
                <span className='text-muted-foreground text-sm'>Showing {items.length} items</span>
                <Button size='sm' onClick={onAddItem}>
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
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className='py-12 text-center'>
                          <div className='inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                          <p className='text-muted-foreground mt-2 text-xs'>Loading items...</p>
                        </td>
                      </tr>
                    ) : items.length > 0 ? (
                    items.map((item) => (
                        <tr key={item.id} className='hover:bg-muted/30 transition-colors'>
                        <td className='px-4 py-3'>
                            <div className='bg-muted border-border h-10 w-10 overflow-hidden rounded-md border'>
                            <img src={item.imageUrl} alt={item.name} className='h-full w-full object-cover' />
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
                                : 'bg-red-500/15 text-red-700 dark:text-red-400'
                            } `}
                            >
                            {item.status}
                            </span>
                        </td>
                        <td className='px-4 py-3 text-end'>
                            <div className='flex items-center justify-end gap-1'>
                            <button
                                onClick={() => onEditItem(item)}
                                className='hover:bg-accent text-muted-foreground hover:text-primary rounded-md p-1.5 transition-colors'
                            >
                                <Pencil className='h-3.5 w-3.5' />
                            </button>
                            <button 
                                onClick={() => onDeleteItem(item)}
                                className='hover:bg-accent text-muted-foreground hover:text-destructive rounded-md p-1.5 transition-colors'
                            >
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
    )
}

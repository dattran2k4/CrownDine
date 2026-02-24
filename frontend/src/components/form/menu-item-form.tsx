import React, { useState } from 'react'
import { Save, ImagePlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export interface ItemFormData {
  name: string
  description: string
  price: number
  status: string
  image: string
}

interface MenuItemFormProps {
  initialData?: ItemFormData | null
  onSubmit: (data: ItemFormData) => void
  onCancel: () => void
}

export const MenuItemForm = ({ initialData, onSubmit, onCancel }: MenuItemFormProps) => {
  const [formData, setFormData] = useState<ItemFormData>(
    initialData || {
      name: '',
      description: '',
      price: 0,
      status: 'AVAILABLE',
      image: ''
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {/* Image Placeholder */}
      <div className='mb-4 flex justify-center'>
        <div className='bg-muted/50 border-border text-muted-foreground hover:border-primary/50 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors'>
          {formData.image ? (
            <img src={formData.image} alt='Preview' className='h-full w-full rounded-lg object-cover' />
          ) : (
            <>
              <ImagePlus className='mb-2 h-6 w-6' />
              <span className='text-xs'>Upload Image</span>
            </>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='item-name'>Item Name</Label>
        <Input
          id='item-name'
          placeholder='e.g. Garlic Bread'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='item-price'>Price ($)</Label>
          <Input
            id='item-price'
            type='number'
            placeholder='0.00'
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='item-status'>Status</Label>
          <select
            id='item-status'
            className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value='AVAILABLE'>Available</option>
            <option value='UNAVAILABLE'>Unavailable</option>
          </select>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='item-description'>Description</Label>
        <textarea
          id='item-description'
          className='border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          placeholder='Brief description...'
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className='flex justify-end gap-3 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>
          <Save className='mr-2 h-4 w-4' />
          Save Item
        </Button>
      </div>
    </form>
  )
}

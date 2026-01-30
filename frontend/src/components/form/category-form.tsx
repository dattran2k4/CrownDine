import React, { useState } from 'react'
import { Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface CategoryFormData {
  name: string
  description: string
}

interface CategoryFormProps {
  initialData?: CategoryFormData | null
  onSubmit: (data: CategoryFormData) => void
  onCancel: () => void
}

export const CategoryForm = ({ initialData, onSubmit, onCancel }: CategoryFormProps) => {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || {
      name: '',
      description: ''
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Name</Label>
        <Input
          id='name'
          placeholder='e.g. Starters'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='description'>Description</Label>
        <textarea
          id='description'
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
          Save
        </Button>
      </div>
    </form>
  )
}

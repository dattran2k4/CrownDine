import React, { useState } from 'react'
import { Save, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import itemApi from '@/apis/item.api'
import type { Combo } from '@/types/combo.type'

export interface ComboFormData {
  name: string
  description: string
  price: number
  items: { itemId: number; quantity: number }[]
}

interface ComboFormProps {
  initialData?: Combo | null
  onSubmit: (data: ComboFormData) => void
  onCancel: () => void
}

export const ComboForm = ({ initialData, onSubmit, onCancel }: ComboFormProps) => {
  const [formData, setFormData] = useState<ComboFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    items: initialData?.items?.map(item => ({ itemId: item.itemId, quantity: item.quantity })) || []
  })

  // Fetch all items to populate selection
  const { data: itemsData } = useQuery({
    queryKey: ['all-items'],
    queryFn: () => itemApi.getItems()
  })

  const allItems = itemsData?.data.data || []

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: allItems[0]?.id || 0, quantity: 1 }]
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items]
    newItems.splice(index, 1)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index: number, field: 'itemId' | 'quantity', value: number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {/* Left Side: Basic Info */}
        <div className='space-y-4 border-r-0 md:border-r md:pr-8'>
          <h3 className='text-lg font-semibold'>Thông tin cơ bản</h3>
          <div className='space-y-2'>
            <Label htmlFor='combo-name'>Tên Combo</Label>
            <Input
              id='combo-name'
              placeholder='VD: Combo Gia Đình'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='combo-price'>Giá Niêm Yết</Label>
            <Input
              id='combo-price'
              type='number'
              placeholder='VD: 500000'
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='combo-description'>Mô tả</Label>
            <textarea
              id='combo-description'
              className='border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              placeholder='Mô tả ngắn gọn về combo...'
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Right Side: Combo Items */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Thành phần Combo</h3>
            <Button type='button' variant='outline' size='sm' onClick={handleAddItem}>
              <Plus className='mr-2 h-4 w-4' />
              Thêm món
            </Button>
          </div>

          <div className='max-h-[350px] space-y-3 overflow-y-auto pr-2'>
            {formData.items.map((item, index) => (
              <div key={index} className='bg-muted/30 relative flex items-end gap-3 rounded-lg border p-3 pt-4'>
                <div className='flex-1 space-y-1.5'>
                  <Label className='text-xs'>Món lẻ</Label>
                  <select
                    className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus:ring-1 focus:outline-none'
                    value={item.itemId}
                    onChange={(e) => handleItemChange(index, 'itemId', Number(e.target.value))}
                  >
                    <option value={0} disabled>Chọn món ăn...</option>
                    {allItems.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name} - {opt.price.toLocaleString()}đ</option>
                    ))}
                  </select>
                </div>
                <div className='w-24 space-y-1.5'>
                  <Label className='text-xs'>Số lượng</Label>
                  <Input
                    type='number'
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                  />
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:text-destructive hover:bg-destructive/10 -mb-0.5'
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
            {formData.items.length === 0 && (
              <div className='flex h-32 flex-col items-center justify-center rounded-lg border border-dashed'>
                <p className='text-muted-foreground text-sm italic'>
                  Chưa có món ăn nào trong combo này.
                </p>
                <Button type='button' variant='link' size='sm' onClick={handleAddItem}>
                  Nhấn để thêm món ngay
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-3 border-t pt-6'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Hủy
        </Button>
        <Button type='submit' className='px-8'>
          <Save className='mr-2 h-4 w-4' />
          Lưu Combo
        </Button>
      </div>
    </form>
  )
}

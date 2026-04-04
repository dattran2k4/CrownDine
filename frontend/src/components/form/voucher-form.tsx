import React, { useState } from 'react'
import { Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Voucher } from '@/types/voucher.type'
import type { VoucherFormData } from '@/types/voucher.type'

interface VoucherFormProps {
  initialData?: Voucher | null
  onSubmit: (data: VoucherFormData) => void
  onCancel: () => void
}

export function VoucherForm({ initialData, onSubmit, onCancel }: VoucherFormProps) {
  const [formData, setFormData] = useState<VoucherFormData>({
    name: initialData?.name ?? '',
    code: initialData?.code ?? '',
    type: initialData?.type ?? 'PERCENTAGE',
    discountValue: initialData?.discountValue != null ? String(initialData.discountValue) : '',
    maxDiscountValue: initialData?.maxDiscountValue != null ? String(initialData.maxDiscountValue) : '',
    minValue: initialData?.minValue != null ? String(initialData.minValue) : '',
    description: initialData?.description ?? ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const discountValue = parseFloat(formData.discountValue)
    const maxDiscountValue = formData.maxDiscountValue.trim()
      ? parseFloat(formData.maxDiscountValue)
      : undefined
    const minValue = formData.minValue.trim() ? parseFloat(formData.minValue) : undefined
    if (Number.isNaN(discountValue) || discountValue <= 0) return
    if (maxDiscountValue !== undefined && (Number.isNaN(maxDiscountValue) || maxDiscountValue <= 0)) return
    if (minValue !== undefined && (Number.isNaN(minValue) || minValue <= 0)) return
    onSubmit({
      ...formData,
      discountValue: formData.discountValue,
      maxDiscountValue: maxDiscountValue != null ? String(maxDiscountValue) : '',
      minValue: minValue != null ? String(minValue) : '',
      description: formData.description || ''
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='voucher-name'>Tên voucher</Label>
        <Input
          id='voucher-name'
          placeholder='VD: Giảm 20% đơn hàng'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          maxLength={100}
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='voucher-code'>Mã voucher</Label>
        <Input
          id='voucher-code'
          placeholder='VD: GIAM20'
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          maxLength={100}
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='voucher-type'>Loại giảm giá</Label>
        <select
          id='voucher-type'
          className='border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none'
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
        >
          <option value='PERCENTAGE'>Theo phần trăm (%)</option>
          <option value='FIXED_AMOUNT'>Giảm tiền cố định (VNĐ)</option>
        </select>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='voucher-discount'>
          {formData.type === 'PERCENTAGE' ? 'Giá trị giảm (%)' : 'Giá trị giảm (VNĐ)'}
        </Label>
        <Input
          id='voucher-discount'
          type='number'
          min='1'
          step={formData.type === 'PERCENTAGE' ? '1' : '1000'}
          placeholder={formData.type === 'PERCENTAGE' ? 'VD: 20' : 'VD: 50000'}
          value={formData.discountValue}
          onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
          required
        />
      </div>
      {formData.type === 'PERCENTAGE' && (
        <div className='space-y-2'>
          <Label htmlFor='voucher-max'>Giảm tối đa (VNĐ) - tùy chọn</Label>
          <Input
            id='voucher-max'
            type='number'
            min='1000'
            step='1000'
            placeholder='VD: 100000'
            value={formData.maxDiscountValue}
            onChange={(e) => setFormData({ ...formData, maxDiscountValue: e.target.value })}
          />
        </div>
      )}
      <div className='space-y-2'>
        <Label htmlFor='voucher-min-value'>Giá trị đơn tối thiểu (VNĐ) - tùy chọn</Label>
        <Input
          id='voucher-min-value'
          type='number'
          min='1000'
          step='1000'
          placeholder='VD: 200000'
          value={formData.minValue}
          onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='voucher-desc'>Mô tả</Label>
        <textarea
          id='voucher-desc'
          className='border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          placeholder='Mô tả ngắn...'
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className='flex justify-end gap-3 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Hủy
        </Button>
        <Button type='submit'>
          <Save className='mr-2 h-4 w-4' />
          Lưu
        </Button>
      </div>
    </form>
  )
}

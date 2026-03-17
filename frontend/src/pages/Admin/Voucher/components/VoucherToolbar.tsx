import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { VoucherType } from '@/types/voucher.type'

interface VoucherToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilter: VoucherType | ''
  onTypeFilterChange: (value: VoucherType | '') => void
}

export function VoucherToolbar({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange
}: VoucherToolbarProps) {
  return (
    <div className='bg-card border-border flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm'>
      <div className='relative max-w-sm flex-1'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder='Tìm theo tên hoặc mã voucher...'
          className='bg-background pl-9'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className='flex items-center gap-2'>
        <select
          className='border-input bg-background h-9 rounded-md border px-3 text-sm shadow-sm'
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as VoucherType | '')}
        >
          <option value=''>Tất cả loại</option>
          <option value='PERCENTAGE'>Theo %</option>
          <option value='FIXED_AMOUNT'>Giảm tiền cố định</option>
        </select>
      </div>
    </div>
  )
}

import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import type { Combo } from '@/types/combo.type'

interface ComboTableProps {
  combos: Combo[]
  onRowClick: (combo: Combo) => void
  onEdit: (e: React.MouseEvent, combo: Combo) => void
  onDelete: (e: React.MouseEvent, combo: Combo) => void
}

export function ComboTable({ combos, onRowClick, onEdit, onDelete }: ComboTableProps) {
  return (
    <div className='border-border bg-card overflow-hidden rounded-xl border shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-muted/50 text-muted-foreground border-border border-b font-medium'>
            <tr>
              <th className='min-w-[150px] px-6 py-4'>
                <div className='hover:text-foreground flex cursor-pointer items-center gap-2'>
                  Combo Name <ArrowUpDown className='h-3 w-3' />
                </div>
              </th>
              <th className='hidden px-6 py-4 md:table-cell'>Price</th>
              <th className='w-[100px] px-6 py-4 text-end'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-border divide-y'>
            {combos.map((combo) => (
              <tr
                key={combo.id}
                className='group hover:bg-muted/30 cursor-pointer transition-colors'
                onClick={() => onRowClick(combo)}
              >
                <td className='px-6 py-4'>
                  <div className='text-base font-semibold'>{combo.name}</div>
                </td>
                <td className='text-muted-foreground hidden px-6 py-4 md:table-cell'>
                  {combo.price.toLocaleString('vi-VN')}đ
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center justify-end gap-2'>
                    <button
                      onClick={(e) => onEdit(e, combo)}
                      className='hover:bg-accent text-muted-foreground hover:text-primary rounded-md p-2 transition-colors'
                    >
                      <Pencil className='h-4 w-4' />
                    </button>
                    <button
                      onClick={(e) => onDelete(e, combo)}
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
  )
}

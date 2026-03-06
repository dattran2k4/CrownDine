import { Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import type { Combo } from '@/types/combo.type'

interface ComboItemsModalProps {
  isOpen: boolean
  onClose: () => void
  combo: Combo | null
  onEdit: (combo: Combo) => void
}

export function ComboItemsModal({ isOpen, onClose, combo, onEdit }: ComboItemsModalProps) {
  if (!combo) return null

  const items = combo.items || []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết Combo: ${combo.name}`}
      maxWidth='max-w-2xl'
    >
      <div className='space-y-4'>
        <div className='bg-muted/30 flex items-center justify-between rounded-lg p-3'>
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Mô tả</p>
            <p className='text-muted-foreground text-xs'>{combo.description || 'Không có mô tả'}</p>
          </div>
          <div className='text-right'>
            <p className='text-sm font-medium'>Giá Combo</p>
            <p className='text-primary text-lg font-bold'>{combo.price.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>

        <div className='border-border overflow-hidden rounded-lg border'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-muted/50 text-muted-foreground border-border border-b font-medium'>
              <tr>
                <th className='px-4 py-3'>Tên món ăn</th>
                <th className='w-[100px] px-4 py-3 text-center'>Số lượng</th>
              </tr>
            </thead>
            <tbody className='divide-border divide-y'>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={`${item.itemId}-${index}`} className='hover:bg-muted/30 transition-colors'>
                    <td className='px-4 py-3 font-medium'>{item.itemName}</td>
                    <td className='px-4 py-3 text-center font-semibold'>{item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className='text-muted-foreground px-4 py-8 text-center'>
                    Combo này chưa có món ăn thành phần.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className='flex items-center justify-between pt-2'>
           <p className='text-muted-foreground text-xs'>Nhấn nút Sửa để thay đổi thành phần combo.</p>
           <button
             onClick={() => {
               onClose()
               onEdit(combo)
             }}
             className='bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors'
           >
             <Pencil className='h-4 w-4' />
             Chỉnh sửa ngay
           </button>
        </div>
      </div>
    </Modal>
  )
}

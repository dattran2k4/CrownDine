import { Pencil, Users } from 'lucide-react'
import type { Voucher } from '@/types/voucher.type'

interface VoucherTableProps {
  vouchers: Voucher[]
  onEdit: (e: React.MouseEvent, voucher: Voucher) => void
  onAssign: (e: React.MouseEvent, voucher: Voucher) => void
}

function formatDiscount(v: Voucher) {
  if (v.type === 'PERCENTAGE') {
    return `${v.discountValue}%${v.maxDiscountValue ? ` (tối đa ${Number(v.maxDiscountValue).toLocaleString('vi-VN')}đ)` : ''}`
  }
  return `${Number(v.discountValue).toLocaleString('vi-VN')}đ`
}

export function VoucherTable({ vouchers, onEdit, onAssign }: VoucherTableProps) {
  return (
    <div className='border-border bg-card overflow-hidden rounded-xl border shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-muted/50 text-muted-foreground border-border border-b font-medium'>
            <tr>
              <th className='min-w-[120px] px-6 py-4'>Mã</th>
              <th className='min-w-[180px] px-6 py-4'>Tên</th>
              <th className='hidden px-6 py-4 md:table-cell'>Loại</th>
              <th className='hidden px-6 py-4 md:table-cell'>Giảm giá</th>
              <th className='w-[120px] px-6 py-4 text-end'>Thao tác</th>
            </tr>
          </thead>
          <tbody className='divide-border divide-y'>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={5} className='text-muted-foreground px-6 py-12 text-center'>
                  Chưa có voucher nào.
                </td>
              </tr>
            ) : (
              vouchers.map((voucher) => (
                <tr
                  key={voucher.id}
                  className='group hover:bg-muted/30 transition-colors'
                >
                  <td className='px-6 py-4'>
                    <span className='font-mono font-semibold'>{voucher.code}</span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='font-medium'>{voucher.name}</div>
                    {voucher.description && (
                      <div className='text-muted-foreground mt-0.5 truncate max-w-[200px] text-xs'>
                        {voucher.description}
                      </div>
                    )}
                  </td>
                  <td className='hidden px-6 py-4 md:table-cell'>
                    {voucher.type === 'PERCENTAGE' ? 'Theo %' : 'Giảm tiền'}
                  </td>
                  <td className='hidden px-6 py-4 md:table-cell'>
                    {formatDiscount(voucher)}
                    {voucher.minValue != null && (
                      <div className='text-muted-foreground mt-0.5 text-xs'>
                        Đơn tối thiểu {Number(voucher.minValue).toLocaleString('vi-VN')}đ
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        onClick={(e) => onAssign(e, voucher)}
                        className='hover:bg-accent text-muted-foreground hover:text-primary rounded-md p-2 transition-colors'
                        title='Gán cho khách hàng'
                      >
                        <Users className='h-4 w-4' />
                      </button>
                      <button
                        onClick={(e) => onEdit(e, voucher)}
                        className='hover:bg-accent text-muted-foreground hover:text-primary rounded-md p-2 transition-colors'
                        title='Chỉnh sửa'
                      >
                        <Pencil className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

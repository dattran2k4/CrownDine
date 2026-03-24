import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CancelModalProps {
  orderCode: string
  onClose: () => void
  onConfirm: () => void
  isPending?: boolean
}

export function CancelModal({ orderCode, onClose, onConfirm, isPending }: CancelModalProps) {
  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role='dialog'
      aria-modal='true'
    >
      <div
        className={cn(
          'bg-card border-border flex w-full max-w-sm flex-col overflow-hidden rounded-xl border shadow-lg',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='border-border flex items-center justify-between border-b p-5'>
          <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-destructive' /> Hủy đơn hàng
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground rounded p-1 transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='p-6'>
          <p className='text-muted-foreground'>
            Bạn có chắc chắn muốn hủy đơn hàng <strong className='text-foreground'>#{orderCode}</strong>?
          </p>
          <p className='text-muted-foreground mt-2 text-sm'>
            Thao tác này không thể hoàn tác.
          </p>
        </div>

        <div className='border-border flex justify-end gap-2 border-t p-4 bg-muted/20'>
          <Button variant='outline' onClick={onClose} disabled={isPending}>
            Đóng
          </Button>
          <Button variant='destructive' onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </div>
      </div>
    </div>
  )
}

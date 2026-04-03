import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CancelModalProps {
  orderCode: string
  onClose: () => void
  onConfirm: (reason: string) => void
  isPending?: boolean
}

const PREDEFINED_REASONS = ['Khách đổi ý', 'Hết món', 'Đặt nhầm']

export function CancelModal({ orderCode, onClose, onConfirm, isPending }: CancelModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')

  const handleConfirm = () => {
    if (!selectedReason) return
    const finalReason = selectedReason === 'Khác' ? customReason : selectedReason
    onConfirm(finalReason)
  }

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

          <div className='mt-6 space-y-4'>
            <label className='text-sm font-medium text-foreground'>Lý do hủy đơn</label>
            <div className='flex flex-wrap gap-2'>
              {PREDEFINED_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    setSelectedReason(reason)
                    setCustomReason('')
                  }}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors border',
                    selectedReason === reason
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                  )}
                >
                  {reason}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedReason('Khác')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors border',
                  selectedReason === 'Khác'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                )}
              >
                Khác
              </button>
            </div>

            {selectedReason === 'Khác' && (
              <Input
                placeholder='Nhập lý do hủy đơn (bắt buộc)...'
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className='mt-3 focus-visible:ring-destructive'
                autoFocus
              />
            )}
          </div>

          <p className='text-muted-foreground mt-4 text-sm'>
            Thao tác này không thể hoàn tác.
          </p>
        </div>

        <div className='border-border flex justify-end gap-2 border-t p-4 bg-muted/20'>
          <Button variant='outline' onClick={onClose} disabled={isPending}>
            Đóng
          </Button>
          <Button 
            variant='destructive' 
            onClick={handleConfirm} 
            disabled={isPending || !selectedReason || (selectedReason === 'Khác' && !customReason.trim())}
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </div>
      </div>
    </div>
  )
}

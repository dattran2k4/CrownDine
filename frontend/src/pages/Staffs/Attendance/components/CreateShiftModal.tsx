import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import useCreateShift from '@/hooks/useCreateShift'
import { toast } from 'sonner'

interface CreateShiftModalProps {
  onClose: () => void
  onSaved?: () => void
}

export function CreateShiftModal({ onClose, onSaved }: CreateShiftModalProps) {
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('12:00')

  const { mutate: createShift, isPending } = useCreateShift()

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên ca làm việc')
      return
    }

    createShift(
      {
        name: name.trim(),
        startTime: startTime,
        endTime: endTime
      },
      {
        onSuccess: () => {
          onSaved?.()
          onClose()
        }
      }
    )
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'
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
          <h2 className='text-lg font-bold text-foreground'>Thêm Ca Làm Việc</h2>
          <button
            type='button'
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground rounded p-1 transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          <div>
            <Label className='mb-1.5 block'>Tên ca làm việc</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='VD: Ca sáng, Ca tối...'
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='mb-1.5 block'>Giờ bắt đầu</Label>
              <Input
                type='time'
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label className='mb-1.5 block'>Giờ kết thúc</Label>
              <Input
                type='time'
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className='border-border flex justify-end gap-2 border-t p-4'>
          <Button variant='destructive' onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            Lưu
          </Button>
        </div>
      </div>
    </div>
  )
}

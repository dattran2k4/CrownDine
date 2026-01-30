import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) => {
  if (!isOpen) return null
  return (
    <div className='bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
      <div
        className={cn(
          'bg-card border-border animate-in fade-in zoom-in-95 flex max-h-[90vh] w-full flex-col rounded-xl border shadow-lg duration-200',
          maxWidth
        )}
      >
        <div className='border-border flex items-center justify-between border-b p-6'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <button onClick={onClose} className='text-muted-foreground hover:text-foreground'>
            <X className='h-4 w-4' />
          </button>
        </div>
        <div className='overflow-y-auto p-6'>{children}</div>
      </div>
    </div>
  )
}

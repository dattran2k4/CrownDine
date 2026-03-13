import type { is } from 'date-fns/locale'
import { X } from 'lucide-react'

interface ShiftItemProps {
  isAdmin?: boolean
  shiftName: string
  startTime: string
  endTime: string
  onDelete?: () => void
}

export function ShiftItem({ isAdmin = false, shiftName, startTime, endTime, onDelete }: ShiftItemProps) {
  return (
    <div className='group relative mb-1 last:mb-0'>
      <div className='text-foreground absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 rounded-xl bg-white px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-md ring-1 ring-black/5 group-hover:block'>
        {shiftName} ({startTime.slice(0, 5)} - {endTime.slice(0, 5)})
        <div className='absolute top-full left-1/2 -ml-1.5 border-[6px] border-transparent border-t-white'></div>
      </div>

      <div className='flex cursor-pointer items-center justify-between gap-2 rounded-md bg-[#E6F4EA] px-2 py-1 text-[13px] font-medium text-[#137333] transition-colors hover:bg-[#DCECE0]'>
        <span className='truncate'>{shiftName}</span>
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onDelete) onDelete()
            }}
            className='flex h-5 w-5 items-center justify-center rounded-sm opacity-0 transition-all group-hover:opacity-100 hover:bg-[#137333]/15'
          >
            <X className='h-3.5 w-3.5' strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  )
}

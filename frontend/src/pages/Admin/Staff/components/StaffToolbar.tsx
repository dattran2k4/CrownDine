import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface StaffToolbarProps {
    searchTerm: string
    onSearchChange: (value: string) => void
}

export function StaffToolbar({ searchTerm, onSearchChange }: StaffToolbarProps) {
    return (
        <div className='bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-4'>
            <div className='relative max-w-sm flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input 
                placeholder='Search by name, email, or role...' 
                className='pl-9 bg-background/50 focus:bg-background transition-colors'
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
        <div className='flex gap-2'>
            <Button variant='outline' className='hidden sm:flex'>
                <Filter className='mr-2 h-4 w-4' /> Filter
            </Button>
                <Button variant='ghost' size='icon' className='sm:hidden'>
                <Filter className='h-4 w-4' />
            </Button>
        </div>
        </div>
    )
}

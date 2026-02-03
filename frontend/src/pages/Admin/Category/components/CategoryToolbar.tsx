import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface CategoryToolbarProps {
    searchTerm: string
    onSearchChange: (value: string) => void
}

export function CategoryToolbar({ searchTerm, onSearchChange }: CategoryToolbarProps) {
    return (
        <div className='bg-card border-border flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm'>
            <div className='relative max-w-sm flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
                placeholder='Search categories...'
                className='bg-background pl-9'
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            </div>
            <div className='flex items-center gap-2'>
            <button className='border-input hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium shadow-sm transition-colors'>
                <Filter className='mr-2 h-4 w-4' />
                Filter
            </button>
            </div>
        </div>
    )
}

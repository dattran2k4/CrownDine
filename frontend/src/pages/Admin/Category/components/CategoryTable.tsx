import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'

interface Category {
    id: number
    name: string
    description: string
    itemsCount: number
// Add other properties if necessary
}

interface CategoryTableProps {
    categories: Category[]
    onRowClick: (category: Category) => void
    onEdit: (e: React.MouseEvent, category: Category) => void
    onDelete: (e: React.MouseEvent, category: Category) => void
}

export function CategoryTable({ categories, onRowClick, onEdit, onDelete }: CategoryTableProps) {
    return (
        <div className='border-border bg-card overflow-hidden rounded-xl border shadow-sm'>
            <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
                <thead className='bg-muted/50 text-muted-foreground border-border border-b font-medium'>
                <tr>
                    <th className='min-w-[200px] px-6 py-4'>
                    <div className='hover:text-foreground flex cursor-pointer items-center gap-2'>
                        Name <ArrowUpDown className='h-3 w-3' />
                    </div>
                    </th>
                    <th className='hidden px-6 py-4 md:table-cell'>Description</th>
                    <th className='w-[100px] px-6 py-4 text-center'>Items</th>
                    <th className='w-[100px] px-6 py-4 text-end'>Actions</th>
                </tr>
                </thead>
                <tbody className='divide-border divide-y'>
                {categories.map((category) => (
                    <tr
                    key={category.id}
                    className='group hover:bg-muted/30 cursor-pointer transition-colors'
                    onClick={() => onRowClick(category)}
                    >
                    <td className='px-6 py-4'>
                        <div className='text-base font-semibold'>{category.name}</div>
                    </td>
                    <td className='text-muted-foreground hidden px-6 py-4 md:table-cell'>{category.description}</td>
                    <td className='px-6 py-4 text-center font-medium'>{category.itemsCount}</td>
                    <td className='px-6 py-4'>
                        <div className='flex items-center justify-end gap-2'>
                        <button
                            onClick={(e) => onEdit(e, category)}
                            className='hover:bg-accent text-muted-foreground hover:text-primary rounded-md p-2 transition-colors'
                        >
                            <Pencil className='h-4 w-4' />
                        </button>
                        <button
                            onClick={(e) => onDelete(e, category)}
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

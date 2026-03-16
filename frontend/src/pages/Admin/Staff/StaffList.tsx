import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffCard } from './components/StaffCard'
import { StaffToolbar } from './components/StaffToolbar'
import { StaffModal } from './components/StaffModal'
import useStaffs from '@/hooks/useStaffs'

// Mock Data for Staff (Keeping this here for now as page-specific data)

export default function StaffList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: staffs = [], isLoading, isError } = useStaffs()

  // Filter staff based on search
  // Filter staff based on search
  const filteredStaff = staffs.filter((staff) => {
    const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.toLowerCase()
    const search = searchTerm.toLowerCase()

    return (
      fullName.includes(search) ||
      // Sử dụng ?. để an toàn nếu email hoặc role bị null
      (staff.email?.toLowerCase() || '').includes(search) ||
      (staff.role?.toLowerCase() || '').includes(search)
    )
  })

  return (
    <div className='animate-in fade-in space-y-6 duration-500'>
      {/* Header Section */}
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>Staff Management</h1>
          <p className='text-muted-foreground mt-1'>View and manage your team members, schedules, and roles.</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className='shadow-primary/20 hover:shadow-primary/30 shadow-lg transition-shadow'
        >
          <Plus className='mr-2 h-4 w-4' />
          Add New Staff
        </Button>
      </div>

      {/* Toolbar */}
      <StaffToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Staff Grid/List */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filteredStaff.map((staff) => (
          <StaffCard key={staff.id} staff={staff} />
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className='py-12 text-center'>
          <p className='text-muted-foreground'>No staff members found matching your search.</p>
          <Button variant='link' onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Add Staff Modal */}
      <StaffModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}

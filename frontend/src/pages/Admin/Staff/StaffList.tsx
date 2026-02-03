import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffCard } from './components/StaffCard'
import { StaffToolbar } from './components/StaffToolbar'
import { StaffModal } from './components/StaffModal'

// Mock Data for Staff (Keeping this here for now as page-specific data)
const MOCK_STAFF = [
  {
    id: 1,
    name: 'Nguyen Van A',
    role: 'Manager',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
    schedule: 'Full-time',
    joinDate: '2023-01-15'
  },
  {
    id: 2,
    name: 'Tran Thi B',
    role: 'Chef',
    email: 'tranthib@example.com',
    phone: '0909876543',
    status: 'on_shift',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
    schedule: 'Morning Shift',
    joinDate: '2023-03-20'
  },
  {
    id: 3,
    name: 'Le Van C',
    role: 'Server',
    email: 'levanc@example.com',
    phone: '0912345678',
    status: 'off',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    schedule: 'Evening Shift',
    joinDate: '2023-06-10'
  },
  {
    id: 4,
    name: 'Pham Thi D',
    role: 'Server',
    email: 'phamthid@example.com',
    phone: '0987654321',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    schedule: 'Part-time',
    joinDate: '2023-09-05'
  },
  {
    id: 5,
    name: 'Hoang Van E',
    role: 'Bartender',
    email: 'hoangvane@example.com',
    phone: '0965432109',
    status: 'on_shift',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
    schedule: 'Night Shift',
    joinDate: '2023-11-12'
  }
]

export default function StaffList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filter staff based on search
  const filteredStaff = MOCK_STAFF.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>Staff Management</h1>
            <p className='text-muted-foreground mt-1'>View and manage your team members, schedules, and roles.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className='shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow'>
            <Plus className='mr-2 h-4 w-4' />
            Add New Staff
        </Button>
      </div>

      {/* Toolbar */}
      <StaffToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Staff Grid/List */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {filteredStaff.map(staff => (
            <StaffCard key={staff.id} staff={staff} />
        ))}
      </div>
        
         {/* Empty State */}
        {filteredStaff.length === 0 && (
            <div className='text-center py-12'>
                <p className='text-muted-foreground'>No staff members found matching your search.</p>
                <Button variant='link' onClick={() => setSearchTerm('')}>Clear Search</Button>
            </div>
        )}

      {/* Add Staff Modal */}
      <StaffModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffCard } from './components/StaffCard'
import { StaffToolbar } from './components/StaffToolbar'
import { StaffModal } from './components/StaffModal'
import { Modal } from '@/components/ui/modal'
import useStaffs from '@/hooks/useStaffs'
import { useDeleteStaff } from '@/hooks/useDeleteStaff'
import { useToggleStaffStatus } from '@/hooks/useToggleStaffStatus'
import { EStatus } from '@/types/profile.type'

// Mock Data for Staff (Keeping this here for now as page-specific data)

export default function StaffList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: staffs = [], isLoading, isError } = useStaffs()
  const { mutate: deleteStaff } = useDeleteStaff()
  const { mutate: toggleStatus } = useToggleStaffStatus()

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa nhân viên',
      message: 'Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác nếu nhân viên chưa có dữ liệu ràng buộc.',
      onConfirm: () => {
        deleteStaff(id)
        setConfirmModal((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleToggleStatus = (id: string, currentStatus: EStatus) => {
    const action = currentStatus === EStatus.ACTIVE ? 'Khóa' : 'Mở khóa'
    setConfirmModal({
      isOpen: true,
      title: `${action} tài khoản`,
      message: `Bạn có đồng ý ${action.toLowerCase()} tài khoản này?`,
      onConfirm: () => {
        toggleStatus({ id, status: currentStatus === EStatus.ACTIVE ? EStatus.INACTIVE : EStatus.ACTIVE })
        setConfirmModal((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

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
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>Quản lý nhân viên</h1>
          <p className='text-muted-foreground mt-1'>Xem và quản lý thành viên nhóm, lịch làm việc và vai trò.</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className='shadow-primary/20 hover:shadow-primary/30 shadow-lg transition-shadow'
        >
          <Plus className='mr-2 h-4 w-4' />
          Thêm nhân viên
        </Button>
      </div>

      {/* Toolbar */}
      <StaffToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Staff Grid/List */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filteredStaff.map((staff) => (
          <StaffCard key={staff.id} staff={staff} onDelete={handleDelete} ontoggleStatus={handleToggleStatus} />
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className='py-12 text-center'>
          <p className='text-muted-foreground'>Không tìm thấy nhân viên nào phù hợp với tìm kiếm của bạn.</p>
          <Button variant='link' onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Add Staff Modal */}
      <StaffModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Confirm Action Modal */}
      <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({...prev, isOpen: false}))} title={confirmModal.title} maxWidth='max-w-sm'>
        <div className='flex flex-col gap-6'>
          <p className='text-sm text-muted-foreground'>{confirmModal.message}</p>
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))}>Hủy</Button>
            <Button 
              variant={confirmModal.title.includes('Xóa') || confirmModal.title.includes('Khóa') ? 'destructive' : 'default'} 
              onClick={confirmModal.onConfirm}
            >
              Đồng ý
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

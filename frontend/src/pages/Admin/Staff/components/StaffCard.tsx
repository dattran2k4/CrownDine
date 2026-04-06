import { MoreHorizontal, Mail, Phone, Calendar, Unlock, Trash2, Edit, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EStatus, type Staff } from '@/types/profile.type'
import { getImageUrl } from '@/utils/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const RoleBadge = ({ role }: { role: string }) => {
  const styles = {
    Staff: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
  }
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[role as keyof typeof styles] || 'bg-secondary text-secondary-foreground'}`}
    >
      {role}
    </span>
  )
}

const StatusBadge = ({ status }: { status: EStatus }) => {
  const isActive = status === EStatus.ACTIVE
  const baseClasses = 'rounded-full px-2.5 py-0.5 text-xs font-medium'
  const activeClasses = 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
  const inactiveClasses = 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'

  return (
    <span className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

interface StaffCardProps {
  staff: Staff
  onEdit?: (staff: Staff) => void
  onDelete?: (id: string) => void
  ontoggleStatus?: (id: string, currentStatus: EStatus) => void
}

export function StaffCard({ staff, onDelete, onEdit, ontoggleStatus }: StaffCardProps) {
  return (
    <div className='group bg-card hover:bg-muted/40 border-border relative rounded-xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'>
      <div className='mb-4 flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <img
              src={getImageUrl((staff as any).avatarUrl || (staff as any).avatar)}
              alt={`${staff.firstName} ${staff.lastName}` || 'Staff Member'}
              className='border-background h-14 w-14 rounded-full border-2 object-cover shadow-sm'
            />
          </div>
          <div>
            <h3 className='group-hover:text-primary mb-1 text-lg leading-none font-semibold transition-colors'>
              {`${staff.firstName} ${staff.lastName}` || 'Staff Member'}
            </h3>
            <div className='flex items-center gap-2 mt-2'>
              <RoleBadge role={staff.role || 'Staff'} />
              <StatusBadge status={staff.status} />
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='text-muted-foreground h-8 w-8 focus:ring-0'>
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Mở menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48 bg-white'>
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => onEdit?.(staff)} className='cursor-pointer'>
              <Edit className='mr-2 h-4 w-4' />
              <span>Sửa thông tin</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => ontoggleStatus?.(staff.id, staff.status)} className='cursor-pointer'>
              {staff.status === EStatus.ACTIVE ? (
                <>
                  <Lock className='mr-2 h-4 w-4 text-orange-500' />
                  <span className='text-orange-500'>Khóa tài khoản</span>
                </>
              ) : (
                <>
                  <Unlock className='mr-2 h-4 w-4 text-green-600' />
                  <span className='text-green-600'>Mở khóa</span>
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(staff.id)}
              className='cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              <span>Xóa nhân viên</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='space-y-2.5'>
        <div className='text-muted-foreground flex items-center text-sm'>
          <Mail className='mr-2.5 h-3.5 w-3.5 opacity-70' />
          {staff.email}
        </div>
        <div className='text-muted-foreground flex items-center text-sm'>
          <Phone className='mr-2.5 h-3.5 w-3.5 opacity-70' />
          {staff.phone}
        </div>
        <div className='text-muted-foreground flex items-center text-sm'>
          <Calendar className='mr-2.5 h-3.5 w-3.5 opacity-70' />
          Joined {joinDate}
        </div>
      </div>
    </div>
  )
}

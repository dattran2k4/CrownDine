import { MoreHorizontal, Mail, Phone, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    on_shift: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    off: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400'
  }
  
  const labels = {
    active: 'Active',
    on_shift: 'On Shift',
    off: 'Off Duty'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status as keyof typeof styles] || styles.off}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

const RoleBadge = ({ role }: { role: string }) => {
   const styles = {
    Manager: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
    Chef: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    Server: 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
    Bartender: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role as keyof typeof styles] || 'bg-secondary text-secondary-foreground'}`}>
      {role}
    </span>
  )
}

interface StaffCardProps {
    staff: any
}

export function StaffCard({ staff }: StaffCardProps) {
    return (
        <div className='group relative bg-card hover:bg-muted/40 border border-border rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'>
            <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-4'>
                        <div className='relative'>
                        <img 
                            src={staff.avatar} 
                            alt={staff.name} 
                            className='w-14 h-14 rounded-full object-cover border-2 border-background shadow-sm'
                        />
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${
                            staff.status === 'active' || staff.status === 'on_shift' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        </div>
                        <div>
                        <h3 className='font-semibold text-lg leading-none mb-1 group-hover:text-primary transition-colors'>{staff.name}</h3>
                        <RoleBadge role={staff.role} />
                        </div>
                </div>
                
                <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground'>
                    <MoreHorizontal className='h-4 w-4' />
                </Button>
            </div>

            <div className='space-y-2.5'>
                    <div className='flex items-center text-sm text-muted-foreground'>
                    <Mail className='h-3.5 w-3.5 mr-2.5 opacity-70' />
                    {staff.email}
                </div>
                <div className='flex items-center text-sm text-muted-foreground'>
                    <Phone className='h-3.5 w-3.5 mr-2.5 opacity-70' />
                    {staff.phone}
                </div>
                    <div className='flex items-center text-sm text-muted-foreground'>
                    <Calendar className='h-3.5 w-3.5 mr-2.5 opacity-70' />
                    Joined {staff.joinDate}
                </div>
            </div>

            <div className='mt-5 pt-4 border-t border-border flex items-center justify-between'>
                <StatusBadge status={staff.status} />
                <span className='text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded'>
                    {staff.schedule}
                </span>
            </div>
        </div>
    )
}

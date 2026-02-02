import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface StaffModalProps {
    isOpen: boolean
    onClose: () => void
}

export function StaffModal({ isOpen, onClose }: StaffModalProps) {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            title="Add New Staff Member"
        >
            <div className='space-y-4 py-2'>
                <div className="grid gap-2">
                    <label className='text-sm font-medium'>Full Name</label>
                    <Input placeholder="e.g. Nguyen Van A" />
                </div>
                <div className="grid gap-2">
                    <label className='text-sm font-medium'>Email</label>
                    <Input type="email" placeholder="email@example.com" />
                </div>
                <div className="grid gap-2">
                    <label className='text-sm font-medium'>Role</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option>Server</option>
                        <option>Chef</option>
                        <option>Bartender</option>
                        <option>Manager</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onClose}>Add Staff</Button>
                </div>
            </div>
        </Modal>
    )
}

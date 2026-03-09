import type { OrderStatus } from '@/types/order.type'
import clsx from 'clsx'
import { useStompClient } from 'react-stomp-hooks'
import { toast } from 'sonner'

interface Props {
  orderId: number
  currentStatus: OrderStatus
}

export default function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const stompClient = useStompClient()

  const statusOptions: OrderStatus[] = ['PRE_ORDER', 'IN_PROGRESS', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  const handleChange = (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) return

    if (stompClient) {
      stompClient.publish({
        destination: `/app/order/${orderId}/upd-status`,
        body: JSON.stringify(newStatus)
      })
    } else {
      toast.error('Kết nối WebSocket không sẵn sàng!')
    }
  }

  return (
    <div className='relative inline-block w-full min-w-30'>
      <select
        value={currentStatus}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className={clsx(
          'w-full cursor-pointer appearance-none px-3 py-1 text-[10px] font-black tracking-tighter uppercase',
          'border-secondary border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5 active:shadow-none',
          getStatusColor(currentStatus) // Màu nền thay đổi theo status hiện tại
        )}
      >
        {statusOptions.map((status) => (
          <option key={status} value={status} className='text-secondary bg-white font-bold'>
            {status}
          </option>
        ))}
      </select>

      {/* Icon tam giác nhỏ để biết đây là Select box */}
      <div className='pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 border-t-[6px] border-r-4 border-l-4 border-t-current border-r-transparent border-l-transparent opacity-70'></div>
    </div>
  )
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'PRE_ORDER':
      return 'bg-white text-secondary'
    case 'CONFIRMED':
      return 'bg-secondary text-white'
    case 'IN_PROGRESS':
      return 'bg-[#f5a623] text-white' // --warning
    case 'COMPLETED':
      return 'bg-primary text-white' // --primary
    case 'CANCELLED':
      return 'bg-destructive text-white'
    default:
      return 'bg-background text-foreground'
  }
}

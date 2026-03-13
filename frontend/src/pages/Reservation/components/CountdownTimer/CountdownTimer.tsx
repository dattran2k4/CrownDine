import { Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  expiratedAt: string | null // ISO string format
  onExpire: () => void
}

const CountdownTimer = ({ expiratedAt, onExpire }: Props) => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!expiratedAt) {
      setSeconds(0)
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiratedAt).getTime()
      const diff = Math.max(0, Math.floor((expiry - now) / 1000))
      
      setSeconds(diff)
      
      if (diff <= 0) {
        onExpire()
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [expiratedAt, onExpire])

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (!expiratedAt || seconds <= 0) {
    return null
  }

  return (
    <div className='flex animate-pulse items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-red-600'>
      <Clock3 size={16} />
      <span className='text-sm font-bold'>Giữ bàn trong: {fmt(seconds)}</span>
    </div>
  )
}

export default CountdownTimer

import { Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  minutes: number
  onExpire: () => void
}

const CountdownTimer = ({ minutes, onExpire }: Props) => {
  const [seconds, setSeconds] = useState(minutes * 60)

  useEffect(() => {
    if (seconds <= 0) {
      onExpire()
      return
    }
    const timer = setInterval(() => setSeconds((p) => p - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds, onExpire])

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className='flex animate-pulse items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-red-600'>
      <Clock3 size={16} />
      <span className='text-sm font-bold'>Giữ bàn trong: {fmt(seconds)}</span>
    </div>
  )
}

export default CountdownTimer

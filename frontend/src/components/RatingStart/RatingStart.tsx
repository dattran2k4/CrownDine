import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  maxStars?: number
  size?: number
  className?: string
}

const RatingStart = ({ rating, maxStars = 5, size, className = '' }: RatingStarsProps) => {
  // Tính phần trăm độ rộng của lớp màu cam
  // Ví dụ: rating 4.3 / 5 = 0.86 => 86%
  const widthPercentage = (rating / maxStars) * 100

  return (
    <div
      className={`relative inline-block ${className}`}
      role='img'
      aria-label={`Rating: ${rating} out of ${maxStars} stars`}
    >
      {/* 1. Lớp nền (Background): Các ngôi sao chưa được fill (Màu xám/border) */}
      <div className='flex gap-0.5 text-gray-300 dark:text-gray-600'>
        {[...Array(maxStars)].map((_, i) => (
          <Star key={i} size={size} fill='currentColor' stroke='none' className='shrink-0' />
        ))}
      </div>

      {/* 2. Lớp phủ (Foreground): Các ngôi sao màu Cam */}
      {/* width: widthPercentage + overflow: hidden cắt đi phần thừa */}
      <div
        className='text-primary absolute top-0 left-0 flex gap-0.5 overflow-hidden'
        style={{ width: `${widthPercentage}%` }}
      >
        {[...Array(maxStars)].map((_, i) => (
          <Star key={i} size={size} fill='currentColor' stroke='none' className='shrink-0' />
        ))}
      </div>
    </div>
  )
}

export default RatingStart

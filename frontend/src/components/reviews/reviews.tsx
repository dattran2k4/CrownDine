import { Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import feedbackApi from '@/apis/feedback.api'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Review {
  id: string
  author: string
  role: string
  rating: number
  text: string
  date: string
  avatarUrl?: string
}
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className='flex gap-1'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted'}`} />
      ))}
    </div>
  )
}
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className='bg-card border-border hover:border-primary animate-in fade-in slide-in-from-bottom-4 flex flex-col rounded-lg border-2 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg'>
      {/* Rating */}
      <div className='mb-4'>
        <RatingStars rating={review.rating} />
      </div>

      {/* Quote */}
      <blockquote className='text-foreground mb-6 flex-grow leading-relaxed'>"{review.text}"</blockquote>

      {/* Author */}
      <div className='border-border border-t pt-4'>
        <div className='flex items-center gap-3'>
          {review.avatarUrl && (
            <img src={review.avatarUrl} alt={review.author} className='h-10 w-10 rounded-full object-cover' />
          )}
          <div>
            <p className='text-foreground font-bold'>{review.author}</p>
            <p className='text-foreground/60 text-sm'>{review.role}</p>
            <p className='text-foreground/50 mt-1 text-xs'>{review.date}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const Reviews = () => {
  const { data: feedbacksData, isPending } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => feedbackApi.getAllFeedbacks()
  })

  const reviews: Review[] =
    feedbacksData?.data?.data?.map((f) => ({
      id: f.id.toString(),
      author: f.fullName || 'Khách hàng',
      role: 'Thành viên',
      rating: f.rating,
      text: f.comment,
      date: formatDistanceToNow(new Date(f.createdAt), { addSuffix: true, locale: vi }),
      avatarUrl: f.avatarUrl
    })) || []

  const row1 = reviews.filter((_, i) => i % 2 === 0)
  const row2 = reviews.filter((_, i) => i % 2 !== 0)

  return (
    <section className='bg-background overflow-hidden py-20'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='mb-16 text-center'>
          <p className='text-primary mb-2 flex items-center justify-center gap-2 text-sm font-semibold tracking-widest uppercase'>
            <span className='bg-primary inline-block h-1 w-1 rounded-full'></span>
            NHẬN XÉT CỦA KHÁCH HÀNG
          </p>
          <h2 className='mb-4 text-4xl font-bold md:text-5xl'>
            Khách Hàng Nói Gì
            <br />
            <span className='text-primary'>Về Chúng Tôi</span>
          </h2>
          <p className='text-foreground/70 mx-auto max-w-2xl'>
            Đừng chỉ nghe lời chúng tôi kể—hãy lắng nghe những chia sẻ từ những vị khách quý
          </p>
        </div>
      </div>

      {/* Reviews Marquee */}
      {isPending ? (
        <div className='text-center py-10'>
          <p className='text-muted-foreground italic animate-pulse'>Đang tải đánh giá...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className='space-y-10'>
          {/* Row 1: Left to Right */}
          <div className='mask-edge flex overflow-hidden'>
            <div className='animate-marquee-right flex gap-6 px-3'>
              {[...row1, ...row1, ...row1].map((review, index) => (
                <div key={`${review.id}-r1-${index}`} className='w-[400px] flex-shrink-0'>
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Right to Left */}
          <div className='mask-edge flex overflow-hidden'>
            <div className='animate-marquee-left flex gap-6 px-3'>
              {[...row2, ...row2, ...row2].map((review, index) => (
                <div key={`${review.id}-r2-${index}`} className='w-[400px] flex-shrink-0'>
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='text-center py-10'>
          <p className='text-muted-foreground'>Chưa có đánh giá nào.</p>
        </div>
      )}
    </section>
  )
}

export default Reviews

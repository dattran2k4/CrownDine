import { Star } from 'lucide-react'

interface Review {
  id: string
  author: string
  role: string
  rating: number
  text: string
  date: string
}
const reviews: Review[] = [
  {
    id: '1',
    author: 'Sarah Mitchell',
    role: 'Nhà Phê Bình Ẩm Thực, NY Times',
    rating: 5,
    text: 'Một hành trình ẩm thực phi thường. Mỗi món ăn đều kể một câu chuyện, và sự chú ý đến từng chi tiết là không thể so sánh. Một nơi phải đến cho bất kỳ ai yêu thích ẩm thực cao cấp.',
    date: '2 tuần trước'
  },
  {
    id: '2',
    author: 'James Rodriguez',
    role: 'Khách Hàng Thường Xuyên',
    rating: 5,
    text: 'Chúng tôi đã tổ chức mọi kỷ niệm ở đây trong 5 năm qua. Không gian, dịch vụ và thức ăn không bao giờ làm chúng tôi thất vọng. Đơn giản là tốt nhất trong thành phố.',
    date: '1 tháng trước'
  },
  {
    id: '3',
    author: 'Emily Chen',
    role: 'Blogger Ẩm Thực',
    rating: 5,
    text: 'Món sườn Wagyu ở đây ngon hơn bất cứ thứ gì tôi từng ăn. Đầu bếp Marco thực sự có tài năng trong việc tạo ra những kiệt tác ẩm thực!',
    date: '3 tuần trước'
  },
  {
    id: '4',
    author: 'Michael Johnson',
    role: 'Du Khách',
    rating: 5,
    text: 'Một trải nghiệm đặc biệt. Tôi chắc chắn sẽ quay lại khi tôi trở lại thành phố. Đây chính là những gì tôi hình dung về một nhà hàng ẩm thực cao cấp nên có.',
    date: '1 tuần trước'
  },
  {
    id: '5',
    author: 'Jessica Williams',
    role: 'Khách Hàng',
    rating: 5,
    text: 'Hoàn hảo cho những dịp đặc biệt. Không gian thanh lịch, dịch vụ chu đáo và thức ăn tinh tế. Vượt quá năm sao!',
    date: 'Hôm qua'
  },
  {
    id: '6',
    author: 'David Anderson',
    role: 'Nhà Phê Bình Nhà Hàng',
    rating: 5,
    text: 'Điểm số cao nhất. Mọi khía cạnh—từ việc chuẩn bị đến dịch vụ—đều được thực hiện hoàn hảo. CrownDine xứng đáng với mọi ngôi sao Michelin của mình.',
    date: '5 ngày trước'
  }
]
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
    <div className='bg-card border-border hover:border-primary animate-in fade-in slide-in-from-bottom-4 rounded-lg border-2 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg'>
      {/* Rating */}
      <div className='mb-4'>
        <RatingStars rating={review.rating} />
      </div>

      {/* Quote */}
      <blockquote className='text-foreground mb-6 leading-relaxed'>"{review.text}"</blockquote>

      {/* Author */}
      <div className='border-border border-t pt-4'>
        <p className='text-foreground font-bold'>{review.author}</p>
        <p className='text-foreground/60 text-sm'>{review.role}</p>
        <p className='text-foreground/50 mt-2 text-xs'>{review.date}</p>
      </div>
    </div>
  )
}

const Reviews = () => {
  return (
    <section className='bg-background py-20'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <p className='text-primary mb-2 flex items-center justify-center gap-2 text-sm font-semibold tracking-widest uppercase'>
            <span className='bg-primary inline-block h-1 w-1 rounded-full'></span>
            ĐÁNH GIÁ
          </p>
          <h2 className='mb-4 text-4xl font-bold md:text-5xl'>
            Khách Hàng Của Chúng Tôi
            <br />
            <span className='text-primary'>Nói Gì</span>
          </h2>
          <p className='text-foreground/70 mx-auto max-w-2xl'>
            Đừng chỉ nghe lời chúng tôi—hãy lắng nghe từ những khách hàng quý giá của chúng tôi
          </p>
        </div>

        {/* Reviews Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Reviews

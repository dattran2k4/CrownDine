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
    role: 'Food Critic, NY Times',
    rating: 5,
    text: 'An extraordinary culinary journey. Every dish tells a story, and the attention to detail is incomparable. A must-visit for anyone who loves fine dining.',
    date: '2 weeks ago'
  },
  {
    id: '2',
    author: 'James Rodriguez',
    role: 'Regular Guest',
    rating: 5,
    text: "We've celebrated every anniversary here for the past 5 years. The ambiance, service, and food never disappoint. Simply the best in the city.",
    date: '1 month ago'
  },
  {
    id: '3',
    author: 'Emily Chen',
    role: 'Food Blogger',
    rating: 5,
    text: "The Wagyu ribeye here is better than anything I've ever had. Chef Marco truly has a gift for creating culinary masterpieces!",
    date: '3 weeks ago'
  },
  {
    id: '4',
    author: 'Michael Johnson',
    role: 'Tourist',
    rating: 5,
    text: "An exceptional experience. I will definitely return when I'm back in the city. This is what I envision a fine dining restaurant should be.",
    date: '1 week ago'
  },
  {
    id: '5',
    author: 'Jessica Williams',
    role: 'Customer',
    rating: 5,
    text: 'Perfect for special occasions. Elegant ambiance, attentive service, and exquisite food. Beyond five stars!',
    date: 'Yesterday'
  },
  {
    id: '6',
    author: 'David Anderson',
    role: 'Restaurant Critic',
    rating: 5,
    text: 'The highest marks. Every aspect—from the preparation to the service—is executed flawlessly. CrownDine deserves every one of its Michelin stars.',
    date: '5 days ago'
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
            TESTIMONIALS
          </p>
          <h2 className='mb-4 text-4xl font-bold md:text-5xl'>
            What Our Guests
            <br />
            <span className='text-primary'>Say</span>
          </h2>
          <p className='text-foreground/70 mx-auto max-w-2xl'>
            Don't just take our word for it—hear from our valued guests
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

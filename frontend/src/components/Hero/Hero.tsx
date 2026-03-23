'use client'

import { Button } from '@/components/ui/button'
import { Clock, MapPin } from 'lucide-react'

const Hero = () => {
  return (
    <section className='bg-background relative flex min-h-screen items-center overflow-hidden dark:bg-slate-900'>
      {/* Background */}
      <div className='absolute inset-0 z-0 opacity-5 dark:opacity-10'>
        <div className='to-background absolute inset-0 bg-gradient-to-b from-transparent via-transparent dark:to-slate-900'></div>
      </div>

      {/* Main Content */}
      <div className='relative z-10 container mx-auto px-4 py-20'>
        <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
          {/* Left Section - Text Content */}
          <div className='animate-in fade-in slide-in-from-left-8 duration-700'>
            {/* Badge */}
            <div className='border-primary/30 mb-6 inline-block rounded-full border px-4 py-2'>
              <span className='text-primary flex items-center gap-2 text-sm font-semibold'>
                <span className='text-lg'>⭐</span>
                Award-Winning Cuisine
              </span>
            </div>

            {/* Heading */}
            <h1 className='text-foreground mb-4 text-5xl leading-tight font-bold lg:text-6xl'>
              Trải Nghiệm
              <br />
              <span className='text-primary'>Nghệ Thuật Ẩm Thực</span>
            </h1>

            {/* Description */}
            <p className='text-foreground/70 mb-8 max-w-lg text-lg leading-relaxed'>
              Khám phá những hương vị tinh tế được chế biến với tình yêu. Nguyên liệu tươi ngon, công thức truyền thống,
              và trải nghiệm ẩm thực không thể quên đang chờ đợi bạn.
            </p>

            {/* Buttons */}
            <div className='mb-12 flex flex-col gap-4 sm:flex-row'>
              <a href='#reservation'>
                <Button className='bg-primary hover:bg-primary/90 btn-lift border-primary rounded-full border-2 px-8 py-6 text-base font-semibold text-white'>
                  Đặt Bàn
                </Button>
              </a>
              <a href='#menu'>
                <Button
                  variant='outline'
                  className='btn-lift border-foreground/20 hover:border-primary hover:bg-primary/5 rounded-full border-2 bg-transparent px-8 py-6 text-base font-semibold'
                >
                  Xem Thực Đơn
                </Button>
              </a>
            </div>

            {/* Info Section */}
            <div className='flex flex-col gap-6 sm:flex-row'>
              {/* Time */}
              <div className='flex items-start gap-3'>
                <Clock className='text-primary mt-1 h-6 w-6 flex-shrink-0' />
                <div>
                  <p className='text-foreground/60 text-sm'>Mở cửa hàng ngày</p>
                  <p className='text-foreground font-semibold'>9AM - 10PM</p>
                </div>
              </div>

              {/* Location */}
              <div className='flex items-start gap-3'>
                <MapPin className='text-primary mt-1 h-6 w-6 flex-shrink-0' />
                <div>
                  <p className='text-foreground/60 text-sm'>Địa chỉ</p>
                  <p className='text-foreground font-semibold'>123 Gourmet Street, Da Nang</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Image Grid */}
          <div className='animate-in fade-in slide-in-from-right-8 grid h-full grid-cols-2 gap-4 duration-700'>
            {/* Large Image - Top Right */}
            <div className='image-lift relative col-span-1 row-span-2 h-full min-h-[400px] overflow-hidden rounded-lg'>
              <img
                src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=687&auto=format&fit=crop'
                alt='Dining Experience'
                /* h-full (đã sửa) và w-full giúp ảnh tràn hết khung hình */
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105'
              />
            </div>

            {/* Top Left */}
            <div className='image-lift relative overflow-hidden rounded-lg'>
              <img
                src='https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=749&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                alt='Fine Dining'
                className='object-cover'
              />
            </div>

            {/* Bottom Left */}
            <div className='image-lift relative overflow-hidden rounded-lg'>
              <img
                src='https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D'
                alt='Delicious Food'
                className='object-cover'
              />
            </div>

            {/* Badge Overlay */}
            <div className='bg-primary absolute right-4 bottom-4 z-20 rounded-lg px-6 py-3 font-bold text-white'>
              <div className='text-xl'>15+</div>
              <div className='text-xs tracking-wide uppercase'>Nhiều năm xuất sắc</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className='absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transform animate-bounce'>
        <div className='flex flex-col items-center gap-2'>
          <p className='text-foreground/60 text-sm'>Cuộn để khám phá</p>
          <div className='border-primary/40 flex h-10 w-6 items-start justify-center rounded-full border-2 p-2'>
            <div className='bg-primary h-2 w-1 animate-pulse rounded-full'></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

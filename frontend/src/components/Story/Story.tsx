'use client'
const Story = () => {
  return (
    <section id='story' className='bg-card py-20'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 items-center gap-12 md:grid-cols-2'>
          {/* Image */}
          <div className='animate-in fade-in slide-in-from-left-8 relative duration-700'>
            <div className='image-lift relative h-96 overflow-hidden rounded-lg shadow-2xl md:h-[500px]'>
              <img
                src='https://plus.unsplash.com/premium_photo-1687697860831-edaf70e279dd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                alt='Câu chuyện CrownDine'
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105'
              />
            </div>
            {/* Floating Quote */}
            <div className='bg-background border-primary absolute -right-8 -bottom-8 hidden max-w-xs rounded-lg border-l-4 p-6 shadow-xl md:block'>
              <p className='mb-4 text-sm italic'>
                "Nấu ăn là về đam mê, vì vậy tôi luôn muốn đưa tất cả trái tim và linh hồn vào từng món ăn"
              </p>
              <p className='font-bold'>— Đầu Bếp Marco</p>
            </div>
          </div>

          {/* Content */}
          <div className='animate-in fade-in slide-in-from-right-8 duration-700'>
            <p className='text-primary mb-2 flex items-center gap-2 text-sm font-semibold tracking-widest uppercase'>
              <span className='bg-primary inline-block h-1 w-1 rounded-full'></span>
              Our Story
            </p>
            <h2 className='mb-6 text-4xl font-bold md:text-5xl'>
              From Passion to
              <br />
              <span className='text-primary'>Table</span>
            </h2>

            <div className='text-foreground/70 mb-8 space-y-4 leading-relaxed'>
              <p>
                Founded in 2008, CrownDine has become a cornerstone of culinary excellence in the heart of New York
                City. Our journey began with a simple vision: to create dishes that tell stories and bring people
                together.
              </p>
              <p>
                Under the guidance of Executive Chef Marco Bellini, our kitchen transforms the finest seasonal
                ingredients into memorable dining experiences. Every dish is a celebration of tradition, innovation, and
                passion.
              </p>
            </div>

            {/* Stats */}
            <div className='border-border grid grid-cols-3 gap-4 border-t pt-8'>
              <div>
                <div className='text-primary text-4xl font-bold'>15+</div>
                <p className='text-foreground/70 mt-2 text-sm font-semibold uppercase'>Years</p>
              </div>
              <div>
                <div className='text-primary text-4xl font-bold'>50K+</div>
                <p className='text-foreground/70 mt-2 text-sm font-semibold uppercase'>Happy Guests</p>
              </div>
              <div>
                <div className='text-primary text-4xl font-bold'>3</div>
                <p className='text-foreground/70 mt-2 text-sm font-semibold uppercase'>Michelin Stars</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Story

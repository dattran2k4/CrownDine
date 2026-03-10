const Contact = () => {
  return (
    <section id='contact' className='bg-card py-20'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 items-center gap-12 md:grid-cols-2'>
          {/* Image */}
          <div className='animate-in fade-in slide-in-from-left-8 relative order-2 duration-700 md:order-1'>
            <div className='image-lift relative h-96 overflow-hidden rounded-lg shadow-2xl md:h-[500px]'>
              <img
                src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/images/contact-Sm53wBaj7ZIFPXRAbkXaiFqEnWJ9DH.jpg'
                alt='Liên Hệ CrownDine'
                className='h-full w-full object-cover'
              />
            </div>
          </div>

          {/* Content */}
          <div className='animate-in fade-in slide-in-from-right-8 order-1 duration-700 md:order-2'>
            <p className='text-primary mb-2 flex items-center gap-2 text-sm font-semibold tracking-widest uppercase'>
              <span className='bg-primary inline-block h-1 w-1 rounded-full'></span>
              LIÊN HỆ
            </p>
            <h2 className='mb-6 text-4xl font-bold md:text-5xl'>
              Chúng Tôi Rất Mong
              <br />
              <span className='text-primary'>Được Nghe Từ Bạn</span>
            </h2>

            <div className='space-y-6'>
              <div>
                <h3 className='mb-2 text-lg font-bold'>Gọi Cho Chúng Tôi</h3>
                <p className='text-foreground/70'>
                  Gọi cho chúng tôi để đặt bàn hoặc nếu bạn có bất kỳ câu hỏi nào. Chúng tôi rất mong được nghe từ bạn!
                </p>
                <p className='text-primary mt-2 text-lg font-bold'>+1 (555) 123-4567</p>
              </div>

              <div>
                <h3 className='mb-2 text-lg font-bold'>Gửi Email Cho Chúng Tôi</h3>
                <p className='text-foreground/70'>Có câu hỏi hoặc yêu cầu đặc biệt? Hãy gửi email cho chúng tôi.</p>
                <p className='text-primary mt-2 text-lg font-bold'>reservations@lamaison.com</p>
              </div>

              <div>
                <h3 className='mb-2 text-lg font-bold'>Đến Thăm Chúng Tôi</h3>
                <p className='text-foreground/70'>
                  Tìm chúng tôi tại địa chỉ bên dưới. Chúng tôi mở cửa từ 11 giờ sáng đến 11 giờ tối từ thứ Hai đến thứ Bảy.
                </p>
                <p className='text-primary mt-2 text-lg font-bold'>123 Gourmet Street, New York, NY 10001</p>
              </div>

              <div className='border-border border-t pt-6'>
                <p className='text-foreground/70 text-sm'>
                  Giờ Mở Cửa: T2 - T5 11:00 - 22:00 | T6 - T7 11:00 - 23:00 | CN 12:00 - 21:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

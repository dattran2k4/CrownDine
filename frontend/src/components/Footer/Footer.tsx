import { Facebook, Instagram, Twitter } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  return (
    <footer className='bg-secondary text-secondary-foreground'>
      <div className='container mx-auto px-4 py-16'>
        {/* Footer Grid */}
        <div className='animate-in fade-in mb-12 grid grid-cols-1 gap-8 duration-500 md:grid-cols-4'>
          {/* Brand */}
          <div>
            <h3 className='mb-4 text-2xl font-bold'>CrownDine</h3>
            <p className='text-secondary-foreground/80 mb-6'>
              Experience culinary excellence in the heart of New York City. Award-winning cuisine, exceptional service,
              unforgettable moments.
            </p>
            {/* Social Links */}
            <div className='flex gap-4'>
              <a
                href='#'
                className='bg-secondary-foreground/10 hover:bg-primary flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:scale-110'
              >
                <Facebook className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='bg-secondary-foreground/10 hover:bg-primary flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:scale-110'
              >
                <Instagram className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='bg-secondary-foreground/10 hover:bg-primary flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:scale-110'
              >
                <Twitter className='h-5 w-5' />
              </a>
            </div>
          </div>

          {/* Menu Links */}
          <div>
            <h4 className='mb-4 text-lg font-bold'>MENU</h4>
            <ul className='space-y-2'>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Starters
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Mains
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Desserts
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Wine List
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Cocktails
                </a>
              </li>
            </ul>
          </div>

          {/* Visit Links */}
          <div>
            <h4 className='mb-4 text-lg font-bold'>GHÉP THĂM</h4>
            <ul className='space-y-2'>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Đặt Bàn
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Các Sự Kiện Riêng Tư
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Tặng Vé
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Dịch Vụ Ngoài Trời
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Catering
                </a>
              </li>
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className='mb-4 text-lg font-bold'>VỀ</h4>
            <ul className='space-y-2'>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Câu Chuyện Của Chúng Tôi
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Đội Ngũ
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Báo Chí
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Sự Nghiệp
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className='border-secondary-foreground/20 border-t py-8'>
          <div className='flex flex-col items-center justify-between md:flex-row'>
            <p className='text-secondary-foreground/80 text-sm'>© {currentYear} CrownDine. Tất Cả Quyền Đặt Bìa.</p>
            <div className='mt-4 flex gap-6 md:mt-0'>
              <a href='#' className='text-secondary-foreground/80 hover:text-primary text-sm transition-colors'>
                Chính Sách Bảo Mật
              </a>
              <a href='#' className='text-secondary-foreground/80 hover:text-primary text-sm transition-colors'>
                Điều Khoản Dịch Vụ
              </a>
              <a href='#' className='text-secondary-foreground/80 hover:text-primary text-sm transition-colors'>
                Chính Sách Cookie
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

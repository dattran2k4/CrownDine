import Contact from '@/components/Contact'
import Hero from '@/components/Hero/Hero'
import MenuSection from '@/components/MenuSection'
import Reviews from '@/components/reviews'
import Story from '@/components/Story/Story'

const Home = () => {
  return (
    <>
      <main className='bg-background'>
        <Hero />
        <MenuSection />
        <Story />
        <Contact />
        <Reviews />
      </main>
    </>
  )
}

export default Home

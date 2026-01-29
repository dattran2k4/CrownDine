import { SignupForm } from '@/components/form/signup-form'

const Register = () => {
  return (
    <section className='bg-muted bg-gradient-orange flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-md'>
        <SignupForm />
      </div>
    </section>
  )
}

export default Register

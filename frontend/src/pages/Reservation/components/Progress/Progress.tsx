import { CheckCircle } from 'lucide-react'

interface Props {
  currentStep: number
  steps: string[]
}

const Progress = ({ currentStep, steps }: Props) => {
  return (
    <div className='mb-10'>
      <div className='relative z-1 flex items-center justify-between'>
        <div className='absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 transform bg-gray-200'></div>
        <div
          className='bg-primary absolute top-1/2 left-0 -z-10 h-1 -translate-y-1/2 transform transition-all duration-300'
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, idx) => {
          const stepNum = idx + 1
          const isActive = currentStep >= stepNum
          const isCurrent = currentStep === stepNum

          return (
            <div key={step} className='bg-background flex flex-col items-center px-2'>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${isActive ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white text-gray-400'}`}
              >
                {isActive && !isCurrent ? <CheckCircle size={20} /> : stepNum}
              </div>
              <span className={`mt-2 text-xs font-bold ${isActive ? 'text-primary' : 'text-gray-400'}`}>{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Progress

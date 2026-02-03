import { Zap } from 'lucide-react'
import type { User } from '@/types/profile.type'
import {
  calculateMembershipTier,
  getMembershipTierConfig,
  getProgressToNextTier,
  MEMBERSHIP_TIERS
} from '@/lib/membership_tier'
interface MembershipBenefitsProps {
  user: User
}
const MembershipBenefits = ({ user }: MembershipBenefitsProps) => {
  if (user.role !== 'customer' || user.totalSpent === undefined) {
    return null
  }
  const currentTier = calculateMembershipTier(user.totalSpent)
  const tierConfig = getMembershipTierConfig(currentTier)
  const { nextTier, progress, nextTierAmount } = getProgressToNextTier(user.totalSpent)

  return (
    <div className='from-primary/5 to-primary/10 border-primary/20 mt-8 rounded-lg border bg-gradient-to-br p-6'>
      {/* Tier Info */}
      <div className='mb-6'>
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-lg font-bold'>Membership Status</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tierConfig.bgColor} ${tierConfig.color}`}>
            {tierConfig.label}
          </span>
        </div>

        <p className='text-foreground/70 mb-4 text-sm'>
          Total spent: <span className='text-foreground font-bold'>${user.totalSpent.toFixed(2)}</span>
        </p>

        {/* Progress Bar */}
        {nextTier && (
          <div className='mb-4'>
            <div className='text-foreground/60 mb-2 flex justify-between text-xs'>
              <span>{tierConfig.label}</span>
              <span>{progress.toFixed(0)}%</span>
              <span>{MEMBERSHIP_TIERS[nextTier].label}</span>
            </div>
            <div className='bg-foreground/10 h-2 w-full overflow-hidden rounded-full'>
              <div className='bg-primary h-full transition-all duration-500' style={{ width: `${progress}%` }} />
            </div>
            <p className='text-foreground/60 mt-2 text-xs'>
              Spend ${(nextTierAmount - user.totalSpent).toFixed(2)} more to reach {MEMBERSHIP_TIERS[nextTier].label}
            </p>
          </div>
        )}
      </div>

      {/* Current Perks */}
      <div>
        <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
          <Zap className='text-primary h-4 w-4' />
          Your Perks
        </h4>
        <ul className='space-y-2'>
          {tierConfig.perks.map((perk, index) => (
            <li key={index} className='text-foreground/70 flex items-start gap-2 text-sm'>
              <span className='text-primary mt-0.5 font-bold'>✓</span>
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Tier Preview */}
      {nextTier && (
        <div className='border-primary/20 mt-6 border-t pt-6'>
          <h4 className='mb-3 text-sm font-semibold'>Upcoming Perks at {MEMBERSHIP_TIERS[nextTier].label}</h4>
          <ul className='space-y-2'>
            {MEMBERSHIP_TIERS[nextTier].perks.map((perk, index) => (
              <li key={index} className='text-foreground/60 flex items-start gap-2 text-sm'>
                <span className='text-foreground/40 mt-0.5'>→</span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
export default MembershipBenefits

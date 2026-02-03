import type { MembershipTier } from '@/types/profile.type'

export interface MembershipTierConfig {
  tier: MembershipTier
  label: string
  minAmount: number
  maxAmount: number
  color: string
  bgColor: string
  perks: string[]
}

export const MEMBERSHIP_TIERS: Record<MembershipTier, MembershipTierConfig> = {
  bronze: {
    tier: 'bronze',
    label: 'Bronze Member',
    minAmount: 0,
    maxAmount: 499,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    perks: ['Standard dining experience', 'Email updates']
  },
  silver: {
    tier: 'silver',
    label: 'Silver Member',
    minAmount: 500,
    maxAmount: 1499,
    color: 'text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
    perks: ['5% discount on orders', 'Early reservation access', 'Special event invitations']
  },
  gold: {
    tier: 'gold',
    label: 'Gold Member',
    minAmount: 1500,
    maxAmount: 4999,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    perks: ['10% discount on orders', 'Priority reservations', 'Complimentary appetizers']
  },
  platinum: {
    tier: 'platinum',
    label: 'Platinum Member',
    minAmount: 5000,
    maxAmount: Infinity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    perks: ['15% discount on orders', 'VIP table reservations', 'Private dining options', 'Dedicated concierge']
  }
}

export function calculateMembershipTier(totalSpent: number = 0): MembershipTier {
  if (totalSpent >= 5000) return 'platinum'
  if (totalSpent >= 1500) return 'gold'
  if (totalSpent >= 500) return 'silver'
  return 'bronze'
}

export function getMembershipTierConfig(tier: MembershipTier): MembershipTierConfig {
  return MEMBERSHIP_TIERS[tier]
}

export function getProgressToNextTier(totalSpent: number = 0): {
  currentTier: MembershipTier
  nextTier: MembershipTier | null
  currentAmount: number
  nextTierAmount: number
  progress: number
} {
  const currentTier = calculateMembershipTier(totalSpent)
  const tiers: MembershipTier[] = ['bronze', 'silver', 'gold', 'platinum']
  const currentIndex = tiers.indexOf(currentTier)
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null

  let currentAmount = MEMBERSHIP_TIERS[currentTier].minAmount
  let nextTierAmount = nextTier ? MEMBERSHIP_TIERS[nextTier].minAmount : totalSpent + 1

  // For current tier, show progress to next tier
  const spentInCurrentTier = totalSpent - currentAmount
  const nextTierThreshold = nextTierAmount - currentAmount
  const progress = nextTier ? Math.min((spentInCurrentTier / nextTierThreshold) * 100, 100) : 100

  return {
    currentTier,
    nextTier,
    currentAmount,
    nextTierAmount,
    progress
  }
}

export interface Feedback {
  id: number
  rating: number
  comment: string
  itemId: number | null
  comboId: number | null
  orderDetailId: number | null
  userId: number | null
  fullName?: string
  avatarUrl?: string
  guestName?: string
  isFeatured?: boolean
  status?: string
  createdAt: string
  updatedAt: string
}

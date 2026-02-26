export interface Feedback {
  id: number
  rating: number
  comment: string
  itemId: number | null
  comboId: number | null
  orderDetailId: number | null
  userId: number | null
  createdAt: string
  updatedAt: string
}

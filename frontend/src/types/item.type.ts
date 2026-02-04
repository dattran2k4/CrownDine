export type ItemStatus = 'AVAILABLE' | 'SOLD_OUT' | 'STOPPED'

export interface Item {
  id: number
  categoryId: number
  description: string
  imageUrl: string
  name: string
  price: number
  priceAfterDiscount: number | null
  status: string
  createdAt: string
  updatedAt: string
}

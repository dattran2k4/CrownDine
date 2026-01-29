export type ItemStatus = 'AVAILABLE' | 'SOLD_OUT' | 'STOPPED'

export interface Item {
  id: number
  name: string
  description: string
  price: number
  priceAfterDiscount?: number
  imageUrl: string
  status: ItemStatus
  category: string

  soldCount?: number
  rating?: number
  tags?: ('BEST_SELLER' | 'NEW' | 'MUST_TRY')[]
}

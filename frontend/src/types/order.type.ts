import type { Combo } from '@/types/combo.type'
import type { Item } from '@/types/item.type'

export type OrderStatus = 'PRE_ORDER' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type OrderDetailStatus = 'PENDING' | 'COOKING' | 'RESERVED' | 'CANCELLED'

export interface Order {
  id: number
  code: string
  guestName: string
  orderDetails: OrderDetail[]
  staffName: null
  status: OrderStatus
  tableName: null
  totalPrice: number
  updatedAt: string
  createdAt: string
}

export interface OrderDetail {
  id: number
  item?: Item
  combo?: Combo
  note: string
  quantity: number
  status: OrderDetailStatus
  totalPrice: number
}

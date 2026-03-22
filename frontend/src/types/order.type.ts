import type { Combo } from '@/types/combo.type'
import type { Item } from '@/types/item.type'

export type OrderStatus = 'PRE_ORDER' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type OrderDetailStatus = 'PENDING' | 'COOKING' | 'SERVED' | 'CANCELLED'

export interface Order {
  id: number
  code: string
  guestName: string
  orderDetails: OrderDetail[]
  staffName: string | null
  status: OrderStatus
  tableName: string | null
  totalPrice: number
  discountPrice: number
  finalPrice: number
  voucher?: {
    id: number
    code: string
    name: string
  }
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
  createdAt?: string
}

// Request Types
export interface OrderItemRequest {
  itemId?: number
  comboId?: number
  quantity: number
  note?: string
}

export interface OrderRequest {
  tableId?: number | null
  items: OrderItemRequest[]
}

export interface OrderItemBatchRequest {
  items: OrderItemRequest[]
}

export interface UpdateOrderDetailRequest {
  quantity?: number
  note?: string
}

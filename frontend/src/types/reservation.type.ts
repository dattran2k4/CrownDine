import type { Combo } from './combo.type'
import type { Item } from './item.type'
import type { Table as BaseTable } from './table.type'

export interface ReservationCreateRequest {
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  guestNumber: number
  tableId: number
  note?: string
}

export interface ReservationCreateResponse {
  reservationId: number
  date: string
  startTime: string
  endTime: string
  guestNumber: number
  note?: string
  code: string
  status: string
  depositAmount: number
  expiratedAt: string
  tableName: string
  floorNumber?: number
}

export interface OrderLineResponse {
  orderDetailId: number
  name: string
  type: 'ITEM' | 'COMBO'
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderDetailResponse {
  orderId: number
  tableName: string
  status: string
  totalPrice: number
  discountPrice: number
  finalPrice: number
  itemsTotal: number
  tableDeposit: number
  depositAmount: number
  remainingAmount: number
  createdAt: string
  items: OrderLineResponse[]
}

export interface OrderItemRequest {
  itemId?: number
  comboId?: number
  quantity: number
  note?: string
}

export interface OrderItemRemoveRequest {
  itemId?: number
  comboId?: number
}

export interface ReservationUpdateTableRequest {
  tableId: number
}

export type ReservationTable = Omit<BaseTable, 'shape' | 'status'> & {
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'
  type: 'STANDARD' | 'VIP' | 'WINDOW'
}

type MenuItemIdentity = Pick<Item, 'id' | 'name'>
type ComboIdentity = Pick<Combo, 'id' | 'name'>

export type PreOrderItem = MenuItemIdentity & {
  type: 'item'
  price: number
  image: string
}

export type PreOrderCombo = ComboIdentity & {
  type: 'combo'
  price: number
  image: string
}

export type PreOrderEntry = PreOrderItem | PreOrderCombo

export type PreOrderCartItem = PreOrderEntry & { quantity: number }

export interface ReservationHistoryResponse {
  reservationId?: number
  date: string
  startTime: string
  endTime: string
  guestNumber: number
  reservationStatus: string
  tableName: string
  orderId?: number
  orderStatus?: string
  finalPrice?: number
  items?: OrderLineResponse[]
}

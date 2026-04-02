import type { Combo } from './combo.type'
import type { Item } from './item.type'
import type { Table as BaseTable } from './table.type'

export interface ReservationCreateRequest {
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  guestNumber: number
  tableId: number
  note?: string
}

export interface StaffReservationCreateRequest extends ReservationCreateRequest {
  guestName: string
  guestPhone: string
}

export interface ReservationCreateResponse {
  reservationId: number
  reservationCode: string
  expiratedAt: string | null
}

export interface OrderLineResponse {
  orderDetailId: number
  productId: number
  name: string
  type: 'ITEM' | 'COMBO'
  quantity: number
  unitPrice: number
  totalPrice: number
  note?: string
  hasFeedback?: boolean
}

export interface OrderDetailResponse {
  orderId: number | null
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
  areaName?: string
  floorName?: string
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

export type PreOrderCartItem = PreOrderEntry & { quantity: number; note?: string }

export interface ReservationHistoryResponse {
  reservationId?: number
  reservationCode?: string | null
  customerName?: string | null
  guestName?: string | null
  createdByStaffName?: string | null
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
  hasGeneralFeedback?: boolean
  hasFeedback?: boolean // Keep for backward compatibility or during migration
}

export interface StaffReservationResponse {
  id: number
  code: string
  customerName: string
  guestName?: string | null
  createdByStaffName?: string | null
  phone: string
  email: string
  date: string
  startTime: string
  endTime: string
  guestNumber: number
  tableName: string
  note?: string
  status: string
  orderId: number | null
  orderDetails: Array<any>
}

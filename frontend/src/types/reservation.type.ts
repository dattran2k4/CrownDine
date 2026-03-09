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

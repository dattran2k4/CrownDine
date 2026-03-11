export const RESTAURANT_CONFIG = {
  openHour: 10,
  closeHour: 22,
  depositAmount: 200000,
  currency: 'đ'
}

export const USER_INFO = {
  id: 101,
  name: 'Nguyễn Văn A',
  phone: '0905 123 456',
  gender: 'Anh',
  email: 'nguyenvana@gmail.com'
}

export interface Table {
  id: string
  name: string
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'
  type: 'STANDARD' | 'VIP' | 'WINDOW'
}

export interface MenuItem {
  id: number
  name: string
  price: number
  image: string
}

/** Món hoặc combo trong giỏ đặt trước (bước 3) */
export interface PreOrderCartItem {
  type: 'item' | 'combo'
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

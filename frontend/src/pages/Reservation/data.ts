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

export const MOCK_TABLES: Table[] = [
  { id: 'T1', name: 'Bàn 1 (Cửa sổ)', capacity: 2, status: 'AVAILABLE', type: 'WINDOW' },
  { id: 'T2', name: 'Bàn 2 (Cửa sổ)', capacity: 2, status: 'OCCUPIED', type: 'WINDOW' },
  { id: 'T3', name: 'Bàn 3', capacity: 4, status: 'AVAILABLE', type: 'STANDARD' },
  { id: 'T4', name: 'Bàn 4', capacity: 4, status: 'AVAILABLE', type: 'STANDARD' },
  { id: 'T5', name: 'Bàn 5', capacity: 6, status: 'AVAILABLE', type: 'STANDARD' },
  { id: 'V1', name: 'VIP Room 1', capacity: 10, status: 'AVAILABLE', type: 'VIP' }
]

export interface MenuItem {
  id: number
  name: string
  price: number
  image: string
}

export const MOCK_MENU: MenuItem[] = [
  {
    id: 1,
    name: 'Bò Wagyu Dát Vàng',
    price: 1500000,
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=200'
  },
  {
    id: 2,
    name: 'Tôm Hùm Alaska',
    price: 2100000,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=200'
  },
  {
    id: 3,
    name: 'Salad Cá Hồi',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200'
  },
  {
    id: 4,
    name: 'Rượu Vang Đỏ',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200'
  }
]

export const DURATION_OPTIONS = [
  { label: '1 giờ', value: 60 },
  { label: '1.5 giờ', value: 90 },
  { label: '2 giờ (Tiêu chuẩn)', value: 120 },
  { label: '2.5 giờ', value: 150 },
  { label: '3 giờ', value: 180 }
]

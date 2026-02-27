export type UserRole = 'customer' | 'staff' | 'admin'
export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  role: UserRole
  totalSpent?: number // Total amount spent at restaurant
  createdAt: string
  updatedAt: string
}
export type UpdateUserRequest = Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'dateOfBirth' | 'gender'>>
export interface RestaurantTable {
  id: string
  tableNumber: number
  capacity: number
  location: string
  isAvailable: boolean
}

export interface OrderItem {
  id: string
  menuItemId: string
  menuItemName: string
  price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  reservationId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  createdAt: string
}

export interface Reservation {
  id: string
  customerId: string
  tableId: string
  table: RestaurantTable
  startTime: string
  endTime: string
  date: string
  guestNumber: number
  note?: string
  status: 'confirmed' | 'completed' | 'cancelled'
  order?: Order
  createdAt: string
}

export interface ProfileTab {
  id: string
  label: string
  icon: string
}

export interface OTPVerification {
  type: 'email' | 'phone'
  value: string
  code?: string
  isVerified: boolean
}

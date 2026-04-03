export type UserRole = 'customer' | 'staff' | 'admin'
export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export enum EGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}
export enum EStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  dateOfBirth?: string
  gender?: EGender
  role: UserRole
  totalSpent?: number // Total amount spent at restaurant
  rewardPoints?: number
  createdAt: string
  updatedAt: string
}

export interface PointHistory {
  id: number
  pointsChanged: number
  reason: 'EARN_FROM_ORDER' | 'SPEND_ON_VOUCHER' | 'ADMIN_ADJUSTMENT'
  referenceId?: number
  createdAt: string
}
export type Staff = {
  id: string
  firstName: string
  status: EStatus
  lastName: string
  role: 'Staff'
  email: string
  phone: string
  avatar: string
  joinDate: string
}

export type UserSummary = Pick<User, 'firstName' | 'lastName' | 'phone' | 'email' | 'gender'>
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
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

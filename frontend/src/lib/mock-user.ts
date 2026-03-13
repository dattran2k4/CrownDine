import { EGender, type User, type Reservation, type Order, type RestaurantTable, type OrderItem } from '@/types/profile.type'

// Mock current user
export const mockCurrentUser: User = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  dateOfBirth: '1990-05-15',
  gender: EGender.MALE,
  role: 'customer',
  totalSpent: 389.05, // Sum of all orders: 174 + 112.7 + 102.35
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2024-01-30T14:30:00Z'
}

// Mock restaurant tables
export const mockTables: RestaurantTable[] = [
  {
    id: 'table-1',
    tableNumber: 1,
    capacity: 2,
    location: 'Window Seat',
    isAvailable: true
  },
  {
    id: 'table-2',
    tableNumber: 2,
    capacity: 4,
    location: 'Main Dining',
    isAvailable: true
  },
  {
    id: 'table-3',
    tableNumber: 3,
    capacity: 6,
    location: 'Private Area',
    isAvailable: false
  },
  {
    id: 'table-4',
    tableNumber: 4,
    capacity: 8,
    location: 'VIP Section',
    isAvailable: true
  }
]

// Mock orders with items
const mockOrderItems1: OrderItem[] = [
  {
    id: 'item-1',
    menuItemId: 'menu-1',
    menuItemName: 'Truffle Burrata',
    price: 18,
    quantity: 1,
    subtotal: 18
  },
  {
    id: 'item-2',
    menuItemId: 'menu-3',
    menuItemName: 'Wagyu Ribeye',
    price: 55,
    quantity: 2,
    subtotal: 110
  },
  {
    id: 'item-3',
    menuItemId: 'menu-7',
    menuItemName: 'Chocolate Soufflé',
    price: 16,
    quantity: 2,
    subtotal: 32
  }
]

const mockOrderItems2: OrderItem[] = [
  {
    id: 'item-4',
    menuItemId: 'menu-2',
    menuItemName: 'Tuna Tartare',
    price: 22,
    quantity: 1,
    subtotal: 22
  },
  {
    id: 'item-5',
    menuItemId: 'menu-4',
    menuItemName: 'Lobster Risotto',
    price: 48,
    quantity: 1,
    subtotal: 48
  },
  {
    id: 'item-6',
    menuItemId: 'menu-8',
    menuItemName: 'Crème Brûlée',
    price: 14,
    quantity: 2,
    subtotal: 28
  }
]

const mockOrderItems3: OrderItem[] = [
  {
    id: 'item-7',
    menuItemId: 'menu-5',
    menuItemName: 'Signature Combo',
    price: 89,
    quantity: 1,
    subtotal: 89
  }
]

// Mock orders
const mockOrder1: Order = {
  id: 'order-1',
  reservationId: 'reservation-1',
  items: mockOrderItems1,
  subtotal: 160,
  tax: 24,
  discount: 10,
  total: 174,
  notes: 'No onions in the Truffle Burrata',
  createdAt: '2024-01-28T19:30:00Z'
}

const mockOrder2: Order = {
  id: 'order-2',
  reservationId: 'reservation-2',
  items: mockOrderItems2,
  subtotal: 98,
  tax: 14.7,
  discount: 0,
  total: 112.7,
  createdAt: '2024-01-21T18:45:00Z'
}

const mockOrder3: Order = {
  id: 'order-3',
  reservationId: 'reservation-3',
  items: mockOrderItems3,
  subtotal: 89,
  tax: 13.35,
  discount: 0,
  total: 102.35,
  createdAt: '2024-01-14T19:00:00Z'
}

// Mock reservations
export const mockReservations: Reservation[] = [
  {
    id: 'reservation-1',
    customerId: 'user-1',
    tableId: 'table-2',
    table: mockTables[1],
    startTime: '19:30',
    endTime: '21:30',
    date: '2024-01-28',
    guestNumber: 4,
    note: 'Anniversary dinner',
    status: 'completed',
    order: mockOrder1,
    createdAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 'reservation-2',
    customerId: 'user-1',
    tableId: 'table-1',
    table: mockTables[0],
    startTime: '18:45',
    endTime: '20:15',
    date: '2024-01-21',
    guestNumber: 2,
    status: 'completed',
    order: mockOrder2,
    createdAt: '2024-01-18T14:30:00Z'
  },
  {
    id: 'reservation-3',
    customerId: 'user-1',
    tableId: 'table-3',
    table: mockTables[2],
    startTime: '19:00',
    endTime: '21:00',
    date: '2024-01-14',
    guestNumber: 3,
    status: 'completed',
    order: mockOrder3,
    createdAt: '2024-01-10T11:00:00Z'
  }
]

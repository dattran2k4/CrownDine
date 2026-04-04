export interface ChartData {
  label: string
  value: number
}

export interface DashboardSalesResponse {
  completedOrdersToday: number
  completedGrowthPercentage: number
  completedTotalAmount: number
  completedOrdersYesterday: number
  servingOrdersToday: number
  servingTotalAmount: number
  totalCustomersToday: number
  totalCustomersYesterday: number
  customersGrowthPercentage: number
  rangeTotalAmount: number
  rangeTotalCustomers: number
  revenueChart: ChartData[]
  customerChart: ChartData[]
  topProducts: ChartData[]
  topProductsQuantity: ChartData[]
  recentActivities: RecentActivity[]
}

export interface RecentActivity {
  id: string
  user: string
  action: string
  value: string
  time: string
  type: 'sale' | 'import' | 'delete'
  reason?: string
}

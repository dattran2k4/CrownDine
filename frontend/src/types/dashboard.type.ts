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
  revenueChart: ChartData[]
  customerChart: ChartData[]
  topProducts: ChartData[]
}

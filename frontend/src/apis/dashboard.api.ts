import type { DashboardSalesResponse } from '@/types/dashboard.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const dashboardApi = {
  getSalesResults() {
    return http.get<ApiResponse<DashboardSalesResponse>>('/dashboard/sales-results')
  }
}

export default dashboardApi

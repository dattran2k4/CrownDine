import type { DashboardSalesResponse } from '@/types/dashboard.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const dashboardApi = {
  getSalesResults(viewMode?: string, timeRange?: string) {
    return http.get<ApiResponse<DashboardSalesResponse>>('/dashboard/sales-results', {
      params: { viewMode, timeRange }
    })
  }
}

export default dashboardApi

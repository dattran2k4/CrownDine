import type { Table } from '@/types/table.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

export const TABLE_URL = 'restaurant-tables'

const tableApi = {
  getAllTables() {
    return http.get<ApiResponse<Table[]>>(TABLE_URL)
  }
}

export default tableApi

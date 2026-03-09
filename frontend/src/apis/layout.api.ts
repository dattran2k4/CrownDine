import type {
  AreaRequest,
  FloorLayoutResponse,
  FloorRequest,
  LayoutSaveRequest,
  TableRequest,
  TableLayout
} from '@/types/layout'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const LAYOUT_URL = '/layout'

export type FloorRecord = {
  id: number
  name: string
  restaurantId: number
}

export type AreaRecord = {
  id: number
  name: string
  description: string
}

export type TableRecord = {
  id: number
  name: string
  status: string
  shape: string
  capacity: number
  deposit: number
  width: number
  height: number
  x: number
  y: number
  rotation: number
}

const layoutApi = {
  /* ======================= FLOOR ======================= */
  getAllFloors() {
    return http.get<ApiResponse<FloorRecord[]>>(`${LAYOUT_URL}/floors`)
  },
  createFloor(data: FloorRequest) {
    return http.post<ApiResponse<FloorRecord>>(`${LAYOUT_URL}/floors`, data)
  },
  updateFloor(id: number, data: FloorRequest) {
    return http.put<ApiResponse<FloorRecord>>(`${LAYOUT_URL}/floors/${id}`, data)
  },
  deleteFloor(id: number) {
    return http.delete<ApiResponse<null>>(`${LAYOUT_URL}/floors/${id}`)
  },

  /* ======================= AREA ======================= */
  createArea(floorId: number, data: AreaRequest) {
    return http.post<ApiResponse<AreaRecord>>(`${LAYOUT_URL}/floors/${floorId}/areas`, data)
  },
  updateArea(id: number, data: AreaRequest) {
    return http.put<ApiResponse<AreaRecord>>(`${LAYOUT_URL}/areas/${id}`, data)
  },
  deleteArea(id: number) {
    return http.delete<ApiResponse<null>>(`${LAYOUT_URL}/areas/${id}`)
  },

  /* ======================= TABLE ======================= */
  createTable(areaId: number, data: TableRequest) {
    return http.post<ApiResponse<TableRecord>>(`${LAYOUT_URL}/areas/${areaId}/tables`, data)
  },
  updateTable(id: number, data: TableRequest) {
    return http.put<ApiResponse<TableRecord>>(`${LAYOUT_URL}/tables/${id}`, data)
  },
  deleteTable(id: number) {
    return http.delete<ApiResponse<null>>(`${LAYOUT_URL}/tables/${id}`)
  },

  /* ======================= LOAD FULL LAYOUT ======================= */
  getFloorLayout(floorId: number) {
    return http.get<ApiResponse<FloorLayoutResponse>>(`${LAYOUT_URL}/floors/${floorId}/layout`)
  },

  /* ======================= SAVE FULL LAYOUT ======================= */
  saveLayout(floorId: number, data: LayoutSaveRequest) {
    return http.post<ApiResponse<FloorLayoutResponse>>(`${LAYOUT_URL}/floors/${floorId}/save`, data)
  },

  /* ======================= GET AVAILABLE TABLES ======================= */
  getAvailableTables(params: {
    date: string
    startTime: string
    endTime: string
    guestNumber: number
  }) {
    return http.get<ApiResponse<TableLayout[]>>('/restaurant-tables/available', {
      params
    })
  }
}

export default layoutApi

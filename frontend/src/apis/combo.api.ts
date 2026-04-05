import type { Combo } from '@/types/combo.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const COMBO_URL = 'combos'

const comboApi = {
  getCombos() {
    return http.get<ApiResponse<Combo[]>>(COMBO_URL)
  },
  getComboById(id: number | string) {
    return http.get<ApiResponse<Combo>>(`${COMBO_URL}/${id}`)
  },
  createCombo(data: any) {
    return http.post<ApiResponse<Combo>>(COMBO_URL, data)
  },
  updateCombo(id: number | string, data: any) {
    return http.put<ApiResponse<Combo>>(`${COMBO_URL}/${id}`, data)
  },
  deleteCombo(id: number | string) {
    return http.delete<ApiResponse<any>>(`${COMBO_URL}/${id}`)
  }
}

export default comboApi

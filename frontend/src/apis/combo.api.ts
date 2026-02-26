import type { Combo } from '@/types/combo.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const COMBO_URL = '/combos'

const comboApi = {
  getCombos() {
    return http.get<ApiResponse<Combo[]>>(COMBO_URL)
  },
  getComboById(id: number | string) {
    return http.get<ApiResponse<Combo>>(`${COMBO_URL}/${id}`)
  }
}

export default comboApi

import type { FavoriteListResponse } from '@/types/favorite.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const favoritesApi = {
  getMyFavorites() {
    return http.get<FavoriteListResponse>('favorites')
  },
  addFavoriteItem(itemId: number) {
    return http.post<ApiResponse<null>>(`favorites/items/${itemId}`)
  },
  removeFavoriteItem(itemId: number) {
    return http.delete<ApiResponse<null>>(`favorites/items/${itemId}`)
  },
  addFavoriteCombo(comboId: number) {
    return http.post<ApiResponse<null>>(`favorites/combos/${comboId}`)
  },
  removeFavoriteCombo(comboId: number) {
    return http.delete<ApiResponse<null>>(`favorites/combos/${comboId}`)
  },
  checkIsFavoriteItem(itemId: number) {
    return http.get<ApiResponse<boolean>>(`favorites/items/${itemId}/check`)
  },
  checkIsFavoriteCombo(comboId: number) {
    return http.get<ApiResponse<boolean>>(`favorites/combos/${comboId}/check`)
  }
}

export default favoritesApi

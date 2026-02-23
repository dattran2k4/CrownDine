import type { Item } from '@/types/item.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const ITEM_URL = '/items'

const itemApi = {
  getItems() {
    return http.get<ApiResponse<Item[]>>(ITEM_URL)
  },
  getItemsByCategory(categoryId: number) {
    return http.get<ApiResponse<any>>(`${ITEM_URL}/list`, {
      params: {
        categoryId,
        size: 100 // Get all items for now
      }
    })
  }
}

export default itemApi

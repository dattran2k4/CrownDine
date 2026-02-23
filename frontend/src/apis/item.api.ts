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
  },
  createItem(data: any) {
    return http.post<ApiResponse<Item>>(ITEM_URL, data)
  },
  updateItem(id: number | string, data: any) {
    return http.put<ApiResponse<Item>>(`${ITEM_URL}/${id}`, data)
  },
  deleteItem(id: number | string) {
    return http.delete<ApiResponse<any>>(`${ITEM_URL}/${id}`)
  }
}

export default itemApi

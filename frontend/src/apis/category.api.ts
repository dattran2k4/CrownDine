import type { Category } from '@/types/category.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const CATEGORY_URL = '/categories'

const categoryApi = {
  getCategories() {
    return http.get<ApiResponse<Category[]>>(CATEGORY_URL)
  },
  getCategoryById(id: number | string) {
    return http.get<ApiResponse<Category>>(`${CATEGORY_URL}/${id}`)
  },
  createCategory(data: Omit<Category, 'id' | 'slug'>) {
    return http.post<ApiResponse<Category>>(CATEGORY_URL, data)
  },
  updateCategory(id: number | string, data: Omit<Category, 'id' | 'slug'>) {
    return http.put<ApiResponse<Category>>(`${CATEGORY_URL}/${id}`, data)
  },
  deleteCategory(id: number | string) {
    return http.delete<ApiResponse<any>>(`${CATEGORY_URL}/${id}`)
  }
}

export default categoryApi

import type { Category } from '@/types/category.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const CATEGORY_URL = '/categories'

const categoryApi = {
  getCategories() {
    return http.get<ApiResponse<Category[]>>(CATEGORY_URL)
  }
}

export default categoryApi

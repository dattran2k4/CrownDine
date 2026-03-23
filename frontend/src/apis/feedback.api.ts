import type { Feedback } from '@/types/feedback.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const FEEDBACK_URL = '/feedbacks'

const feedbackApi = {
  getFeedbacksByItem(itemId: number | string) {
    return http.get<ApiResponse<Feedback[]>>(`${FEEDBACK_URL}/items/${itemId}`)
  },
  getFeedbacksByCombo(comboId: number | string) {
    return http.get<ApiResponse<Feedback[]>>(`${FEEDBACK_URL}/combos/${comboId}`)
  }
}

export default feedbackApi

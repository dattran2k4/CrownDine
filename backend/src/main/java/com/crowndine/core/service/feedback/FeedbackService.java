package com.crowndine.core.service.feedback;

import com.crowndine.presentation.dto.request.FeedbackCreateRequest;
import com.crowndine.presentation.dto.request.FeedbackUpdateRequest;
import com.crowndine.presentation.dto.response.FeedbackResponse;

import java.util.List;

public interface FeedbackService {
    FeedbackResponse createFeedback(String username, FeedbackCreateRequest request);

    FeedbackResponse updateFeedback(Long id, String username, FeedbackUpdateRequest request);

    List<FeedbackResponse> getFeedbacksByItem(Long itemId);

    List<FeedbackResponse> getFeedbacksByCombo(Long comboId);
    List<FeedbackResponse> getAllFeedbacks();
}

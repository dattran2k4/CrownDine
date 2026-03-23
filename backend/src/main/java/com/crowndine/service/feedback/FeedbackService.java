package com.crowndine.service.feedback;

import com.crowndine.dto.request.FeedbackCreateRequest;
import com.crowndine.dto.request.FeedbackUpdateRequest;
import com.crowndine.dto.response.FeedbackResponse;

import java.util.List;

public interface FeedbackService {
    FeedbackResponse createFeedback(String username, FeedbackCreateRequest request);

    FeedbackResponse updateFeedback(Long id, String username, FeedbackUpdateRequest request);

    List<FeedbackResponse> getFeedbacksByItem(Long itemId);

    List<FeedbackResponse> getFeedbacksByCombo(Long comboId);
}

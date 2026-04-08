package com.crowndine.presentation.controller;

import com.crowndine.presentation.dto.request.FeedbackCreateRequest;
import com.crowndine.presentation.dto.request.FeedbackUpdateRequest;
import com.crowndine.presentation.dto.response.ApiResponse;
import com.crowndine.presentation.dto.response.FeedbackResponse;
import com.crowndine.core.service.feedback.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api/feedbacks")
@Slf4j(topic = "API-FEEDBACK-CONTROLLER")
public class ApiFeedbackController {
    private final FeedbackService feedbackService;
    @PostMapping
    public ApiResponse createFeedback(@Valid @RequestBody FeedbackCreateRequest request, Principal principal) {
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo feedback thành công")
                .data(feedbackService.createFeedback(principal.getName(), request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse updateFeedback(@PathVariable Long id, @Valid @RequestBody FeedbackUpdateRequest request, Principal principal) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                        .message("Cập nhật feedback thành công")
                        .data(feedbackService.updateFeedback(id, principal.getName(), request))
                        .build();

    }
    @GetMapping("/items/{itemId}")
    public ApiResponse getFeedbacksByItem(@PathVariable Long itemId) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy feedback theo item thành công")
                .data(feedbackService.getFeedbacksByItem(itemId))
                .build();
    }

    @GetMapping("/combos/{comboId}")
    public ApiResponse getFeedbacksByCombo(@PathVariable Long comboId) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy feedback theo combo thành công")
                .data(feedbackService.getFeedbacksByCombo(comboId))
                .build();
    }

    @GetMapping
    public ApiResponse getFeedbacks() {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy tất cả feedback thành công")
                .data(feedbackService.getAllFeedbacks())
                .build();
    }

}

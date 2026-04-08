package com.crowndine.core.service.payment;

import com.crowndine.presentation.dto.request.PaymentFilterRequest;
import com.crowndine.presentation.dto.response.PageResponse;
import com.crowndine.presentation.dto.response.PaymentDetailResponse;
import com.crowndine.presentation.dto.response.PaymentSummaryResponse;

public interface PaymentService {

    PageResponse<PaymentSummaryResponse> getPayments(PaymentFilterRequest request, int page, int size);

    PaymentDetailResponse getPaymentDetail(Long id);

    PaymentDetailResponse getPaymentDetailByCode(Long code, String username);
}

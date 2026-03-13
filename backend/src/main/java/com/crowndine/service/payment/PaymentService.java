package com.crowndine.service.payment;

import com.crowndine.dto.request.PaymentFilterRequest;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.PaymentDetailResponse;
import com.crowndine.dto.response.PaymentSummaryResponse;

public interface PaymentService {

    PageResponse<PaymentSummaryResponse> getPayments(PaymentFilterRequest request, int page, int size);

    PaymentDetailResponse getPaymentDetail(Long id);
}

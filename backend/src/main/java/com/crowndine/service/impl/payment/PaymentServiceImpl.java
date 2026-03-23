package com.crowndine.service.impl.payment;

import com.crowndine.dto.request.PaymentFilterRequest;
import com.crowndine.dto.response.PageResponse;
import com.crowndine.dto.response.PaymentDetailResponse;
import com.crowndine.dto.response.PaymentSummaryResponse;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.Payment;
import com.crowndine.repository.PaymentRepository;
import com.crowndine.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "PAYMENT-SERVICE")
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    public PageResponse<PaymentSummaryResponse> getPayments(PaymentFilterRequest request, int page, int size) {
        int pageNumber = (page > 0) ? page - 1 : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, size, Sort.by(Sort.Direction.DESC, "id"));

        Specification<Payment> specification = PaymentSpecification.filterPayments(request);

        Page<Payment> paymentPage = paymentRepository.findAll(specification, pageRequest);

        List<PaymentSummaryResponse> responses = paymentPage.stream().map(this::toSummaryResponse).toList();

        return PageResponse.<PaymentSummaryResponse>builder()
                .page(page)
                .pageSize(size)
                .totalPages(paymentPage.getTotalPages())
                .totalItems(paymentPage.getTotalElements())
                .data(responses)
                .build();
    }

    @Override
    public PaymentDetailResponse getPaymentDetail(Long id) {
        Payment payment = paymentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return toDetailResponse(payment);
    }

    private PaymentSummaryResponse toSummaryResponse(Payment payment) {
        PaymentSummaryResponse response = new PaymentSummaryResponse();
        response.setId(payment.getId());
        response.setCode(payment.getCode());
        response.setUsername(payment.getCreatedBy() != null ? payment.getCreatedBy().getUsername() : null);
        response.setOrderCode(payment.getOrder() != null ? payment.getOrder().getCode() : null);
        response.setReservationCode(payment.getReservation() != null ? payment.getReservation().getCode() : null);
        response.setAmount(payment.getAmount());
        response.setTransactionCode(payment.getTransactionCode());
        response.setMethod(payment.getMethod());
        response.setStatus(payment.getStatus());
        response.setType(payment.getType());
        response.setTarget(payment.getTarget());
        response.setSource(payment.getSource());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }

    private PaymentDetailResponse toDetailResponse(Payment payment) {
        PaymentDetailResponse response = new PaymentDetailResponse();
        response.setId(payment.getId());
        response.setCode(payment.getCode());
        response.setAmount(payment.getAmount());
        response.setTransactionCode(payment.getTransactionCode());
        response.setRawApiData(payment.getRawApiData());
        response.setMethod(payment.getMethod());
        response.setStatus(payment.getStatus());
        response.setType(payment.getType());
        response.setTarget(payment.getTarget());
        response.setSource(payment.getSource());
        response.setOrderCode(payment.getOrder() != null ? payment.getOrder().getCode() : null);
        response.setReservationCode(payment.getReservation() != null ? payment.getReservation().getCode() : null);
        response.setUsername(payment.getCreatedBy() != null ? payment.getCreatedBy().getUsername() : null);
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }
}

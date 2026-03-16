package com.crowndine.service.impl.payment;

import com.crowndine.dto.request.PaymentFilterRequest;
import com.crowndine.model.Payment;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class PaymentSpecification {

    private PaymentSpecification() {
    }

    public static Specification<Payment> filterPayments(PaymentFilterRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            addEnumFilters(request, root, cb, predicates);
            addDateFilters(request, root, cb, predicates);
            addSearchFilter(request, root, cb, predicates);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addEnumFilters(PaymentFilterRequest request,
                                       Root<Payment> root,
                                       CriteriaBuilder cb,
                                       List<Predicate> predicates) {
        if (request.getMethod() != null) {
            predicates.add(cb.equal(root.get("method"), request.getMethod()));
        }
        if (request.getStatus() != null) {
            predicates.add(cb.equal(root.get("status"), request.getStatus()));
        }
        if (request.getType() != null) {
            predicates.add(cb.equal(root.get("type"), request.getType()));
        }
        if (request.getTarget() != null) {
            predicates.add(cb.equal(root.get("target"), request.getTarget()));
        }
        if (request.getSource() != null) {
            predicates.add(cb.equal(root.get("source"), request.getSource()));
        }
    }

    private static void addDateFilters(PaymentFilterRequest request,
                                       Root<Payment> root,
                                       CriteriaBuilder cb,
                                       List<Predicate> predicates) {
        if (request.getFromDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), request.getFromDate().atStartOfDay()));
        }
        if (request.getToDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), request.getToDate().atTime(23, 59, 59)));
        }
    }

    private static void addSearchFilter(PaymentFilterRequest request,
                                        jakarta.persistence.criteria.Root<Payment> root,
                                        jakarta.persistence.criteria.CriteriaBuilder cb,
                                        List<Predicate> predicates) {
        if (!StringUtils.hasText(request.getSearch())) {
            return;
        }

        String keyword = "%" + request.getSearch().trim().toLowerCase() + "%";
        var createdByJoin = root.join("createdBy", JoinType.LEFT);
        var orderJoin = root.join("order", JoinType.LEFT);
        var reservationJoin = root.join("reservation", JoinType.LEFT);

        predicates.add(cb.or(
                cb.like(cb.lower(root.get("transactionCode")), keyword),
                cb.like(cb.lower(root.get("code").as(String.class)), keyword),
                cb.like(cb.lower(createdByJoin.get("username")), keyword),
                cb.like(cb.lower(orderJoin.get("code")), keyword),
                cb.like(cb.lower(reservationJoin.get("code")), keyword)
        ));
    }
}

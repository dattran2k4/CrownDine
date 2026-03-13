package com.crowndine.service.impl.order;

import com.crowndine.common.enums.EOrderStatus;
import com.crowndine.model.Order;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class OrderSpecification {

    private OrderSpecification() {
    }

    public static Specification<Order> filterOrders(LocalDate fromDate, LocalDate toDate, EOrderStatus status) {
        return (root, query, cb) -> {

            Predicate predicate = cb.conjunction();

            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }

            if (fromDate != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay()));
            }

            // Filter đến ngày (<= 23:59:59)
            if (toDate != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("createdAt"), toDate.atTime(23, 59, 59)));
            }

            return predicate;
        };
    }
}

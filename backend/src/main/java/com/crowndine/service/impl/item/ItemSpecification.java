package com.crowndine.service.impl.item;

import com.crowndine.model.Item;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class ItemSpecification {

    private ItemSpecification() {
    }

    public static Specification<Item> filterItem(Long categoryId, String search) {

        return (Root<Item> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {

            Predicate predicate = cb.conjunction();

            if (categoryId != null) {
                predicate = cb.and(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (StringUtils.hasLength(search)) {
                String pattern = String.format("%%%s%%", search.trim().toLowerCase());
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("name")), pattern)
                ));
            }
            return predicate;
        };
    }
}

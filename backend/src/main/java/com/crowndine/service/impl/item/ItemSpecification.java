package com.crowndine.service.impl.item;

import com.crowndine.common.enums.EItemStatus;
import com.crowndine.model.Combo;
import com.crowndine.model.ComboItem;
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
                predicate = cb.and(predicate, cb.equal(root.get("category").get("id"), categoryId));
            }

            predicate = cb.and(predicate, cb.equal(root.get("status"), EItemStatus.AVAILABLE));

            if (StringUtils.hasLength(search)) {
                String pattern = String.format("%%%s%%", search.trim().toLowerCase());

                Join<Item, ComboItem> comboItemJoin = root.join("comboItems", JoinType.LEFT);

                Join<ComboItem, Combo> comboJoin = comboItemJoin.join("combo", JoinType.LEFT);
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(comboJoin.get("name")), pattern)));
            }
            return predicate;
        };
    }
}

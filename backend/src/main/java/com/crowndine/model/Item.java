package com.crowndine.model;


import com.crowndine.common.enums.EItemStatus;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "items")
public class Item extends AbstractEntity<Long> {

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "price")

    private BigDecimal price;
    @Column(name = "price_after_discount")
    private BigDecimal priceAfterDiscount;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EItemStatus status;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}

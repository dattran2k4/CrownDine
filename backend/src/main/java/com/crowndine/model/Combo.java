package com.crowndine.model;

import com.crowndine.common.enums.EComboStatus;
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
@Table(name = "combos")
public class Combo extends AbstractEntity<Long> {

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "slug")
    private String slug;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "price_after_discount")
    private BigDecimal priceAfterDiscount;

    @Column(name = "sold_count")
    private Long soldCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EComboStatus status;

    @OneToMany(mappedBy = "combo", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ComboItem> comboItems;
}

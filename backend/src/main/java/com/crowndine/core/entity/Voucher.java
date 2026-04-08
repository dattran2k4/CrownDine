package com.crowndine.core.entity;

import com.crowndine.common.enums.EVoucherType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vouchers")
public class Voucher extends AbstractEntity<Long> {

    @Column(name = "name", unique = true, length = 100)
    private String name;

    @Column(name = "code", unique = true, length = 100)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private EVoucherType type;

    @Column(name = "discount_value")
    private BigDecimal discountValue;

    @Column(name = "max_discount_value")
    private BigDecimal maxDiscountValue;

    @Column(name = "min_value")
    private BigDecimal minValue;

    @Column(name = "points_required")
    private Integer pointsRequired;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "voucher")
    private List<UserVoucher> userVouchers = new ArrayList<>();

    @OneToMany(mappedBy = "voucher")
    private List<Order> orders = new ArrayList<>();
}

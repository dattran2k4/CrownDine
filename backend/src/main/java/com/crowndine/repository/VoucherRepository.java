package com.crowndine.repository;

import com.crowndine.common.enums.EVoucherType;
import com.crowndine.model.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);

    Optional<Voucher> findByName(String name);

    boolean existsByCode(String code);

    boolean existsByName(String name);

    boolean existsByCodeAndIdNot(String code, Long id);

    boolean existsByNameAndIdNot(String name, Long id);

    @Query("""
            select v from Voucher v
            where (:search is null
                   or lower(v.name) like lower(concat('%', :search, '%'))
                   or lower(v.code) like lower(concat('%', :search, '%'))
                   or lower(v.description) like lower(concat('%', :search, '%')))
              and (:type is null or v.type = :type)
            """)
    Page<Voucher> searchVouchers(@Param("search") String search,
                                 @Param("type") EVoucherType type,
                                 Pageable pageable);
}

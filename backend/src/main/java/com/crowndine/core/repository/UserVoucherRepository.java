package com.crowndine.core.repository;

import com.crowndine.core.entity.UserVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {
    Optional<UserVoucher> findByVoucher_IdAndCustomer_Id(Long voucherId, Long customerId);

    @Query("""
            select uv from UserVoucher uv
            join fetch uv.customer c
            join fetch uv.voucher v
            where v.id = :voucherId
            """)
    List<UserVoucher> findAssignmentsByVoucherId(@Param("voucherId") Long voucherId);

    @Query("""
            select uv from UserVoucher uv
            join fetch uv.voucher v
            where uv.customer.id = :customerId
              and (uv.usageLimit is null or uv.usageCount < uv.usageLimit)
              and (uv.expiredAt is null or uv.expiredAt > :now)
            order by uv.assignedAt desc
            """)
    List<UserVoucher> findAvailableByCustomerId(@Param("customerId") Long customerId,
                                                @Param("now") LocalDateTime now);
}

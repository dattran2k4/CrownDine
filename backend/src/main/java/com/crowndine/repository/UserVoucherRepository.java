package com.crowndine.repository;

import com.crowndine.model.User;
import com.crowndine.model.UserVoucher;
import com.crowndine.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {

    boolean existsByCustomerAndVoucher(User user, Voucher voucher);
}

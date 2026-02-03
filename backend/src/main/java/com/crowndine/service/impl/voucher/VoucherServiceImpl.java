package com.crowndine.service.impl.voucher;

import com.crowndine.exception.InvalidDataException;
import com.crowndine.exception.ResourceNotFoundException;
import com.crowndine.model.User;
import com.crowndine.model.Voucher;
import com.crowndine.repository.UserVoucherRepository;
import com.crowndine.repository.VoucherRepository;
import com.crowndine.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "VOUCHER-SERVICE")
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;

    @Override
    public Voucher getVoucherByCode(String code) {
        return voucherRepository.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
    }

    @Override
    public Voucher getVoucherByCodeAndUser(String code, User user) {
        Voucher voucher = getVoucherByCode(code);

        boolean isOwned = userVoucherRepository.existsByCustomerAndVoucher(user, voucher);

        if (!isOwned) {
            throw new InvalidDataException("Bạn không sở hữu mã giảm giá này");
        }

        return voucher;
    }
}

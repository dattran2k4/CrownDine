package com.crowndine.service.impl.voucher;

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
}

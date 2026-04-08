package com.crowndine.core.service.impl.voucher;

import com.crowndine.common.enums.EVoucherType;
import com.crowndine.presentation.dto.request.VoucherRequest;
import com.crowndine.presentation.dto.response.PageResponse;
import com.crowndine.presentation.dto.response.VoucherResponse;
import com.crowndine.presentation.exception.InvalidDataException;
import com.crowndine.presentation.exception.ResourceNotFoundException;
import com.crowndine.core.entity.Voucher;
import com.crowndine.core.repository.VoucherRepository;
import com.crowndine.core.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "VOUCHER-SERVICE")
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public VoucherResponse createVoucher(VoucherRequest request) {
        log.info("Processing creating voucher");
        String name = request.getName().trim();
        String code = request.getCode().trim().toUpperCase(Locale.ROOT);

        if (voucherRepository.existsByName(name)) {
            throw new InvalidDataException("Tên voucher đã tồn tại");
        }

        if (voucherRepository.existsByCode(code)) {
            throw new InvalidDataException("Mã voucher đã tồn tại");
        }

        Voucher voucher = new Voucher();
        voucher.setName(name);
        voucher.setCode(code);
        voucher.setType(request.getType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMaxDiscountValue(request.getMaxDiscountValue());
        voucher.setMinValue(request.getMinValue());
        voucher.setDescription(request.getDescription());

        validateVoucherBusinessRules(voucher);

        Voucher savedVoucher = voucherRepository.save(voucher);

        log.info("Voucher saved with id {}", savedVoucher.getId());
        return toResponse(savedVoucher);
    }

    @Override
    public PageResponse<VoucherResponse> getVouchers(String search, EVoucherType type, int page, int size) {
        int pageNumber = (page > 0) ? page - 1 : 0;
        PageRequest pageRequest = PageRequest.of(pageNumber, size, Sort.by(Sort.Direction.DESC, "id"));

        Page<Voucher> voucherPage;
        if (StringUtils.hasText(search)) {
            voucherPage = voucherRepository.searchVouchers(search, type, pageRequest);
        } else {
            voucherPage = voucherRepository.searchVouchers(null, type, pageRequest);
        }
        List<VoucherResponse> responses = voucherPage.stream().map(this::toResponse).toList();

        return PageResponse.<VoucherResponse>builder()
                .page(page)
                .pageSize(size)
                .totalPages(voucherPage.getTotalPages())
                .totalItems(voucherPage.getTotalElements())
                .data(responses)
                .build();
    }

    @Override
    public VoucherResponse getVoucherById(Long id) {
        return toResponse(getVoucher(id));
    }

    @Override
    public Voucher getVoucherByCode(String code) {
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);
        return voucherRepository.findByCode(normalizedCode).orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = getVoucher(id);
        String normalizedName = request.getName().trim();
        String normalizedCode = request.getCode().trim().toUpperCase(Locale.ROOT);

        if (voucherRepository.existsByNameAndIdNot(normalizedName, id)) {
            throw new InvalidDataException("Tên voucher đã tồn tại");
        }

        voucher.setName(normalizedName);

        if (voucherRepository.existsByCodeAndIdNot(normalizedCode, id)) {
            throw new InvalidDataException("Mã voucher đã tồn tại");
        }

        voucher.setCode(normalizedCode);
        voucher.setType(request.getType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMaxDiscountValue(request.getMaxDiscountValue());
        voucher.setMinValue(request.getMinValue());
        voucher.setDescription(request.getDescription());

        validateVoucherBusinessRules(voucher);

        Voucher updatedVoucher = voucherRepository.save(voucher);
        return toResponse(updatedVoucher);
    }

    private Voucher getVoucher(Long id) {
        return voucherRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
    }

    private VoucherResponse toResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .name(voucher.getName())
                .code(voucher.getCode())
                .type(voucher.getType())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountValue(voucher.getMaxDiscountValue())
                .minValue(voucher.getMinValue())
                .description(voucher.getDescription())
                .pointsRequired(voucher.getPointsRequired())
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .build();
    }

    private void validateVoucherBusinessRules(Voucher voucher) {
        if (voucher.getType() == EVoucherType.PERCENTAGE
                && voucher.getDiscountValue() != null
                && voucher.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new InvalidDataException("Voucher phần trăm không được lớn hơn 100%");
        }

        if (voucher.getMaxDiscountValue() != null
                && voucher.getMaxDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("Giảm tối đa phải lớn hơn 0");
        }

        if (voucher.getMinValue() != null
                && voucher.getMinValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidDataException("Giá trị đơn tối thiểu phải lớn hơn 0");
        }
    }
}

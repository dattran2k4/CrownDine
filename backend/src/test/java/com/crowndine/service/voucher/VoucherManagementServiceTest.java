package com.crowndine.service.voucher;

import com.crowndine.exception.InvalidDataException;
import com.crowndine.common.enums.EVoucherType;
import com.crowndine.dto.request.VoucherRequest;
import com.crowndine.model.Order;
import com.crowndine.model.UserVoucher;
import com.crowndine.model.Voucher;
import com.crowndine.repository.VoucherRepository;
import com.crowndine.service.impl.voucher.VoucherServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class VoucherManagementServiceTest {
    @Mock
    VoucherRepository repository;

    private VoucherRequest rewardRequest() {
        VoucherRequest request = new VoucherRequest();
        ReflectionTestUtils.setField(request, "name", "Quà 50 điểm");
        ReflectionTestUtils.setField(request, "code", "REWARD50");
        ReflectionTestUtils.setField(request, "type", EVoucherType.FIXED_AMOUNT);
        ReflectionTestUtils.setField(request, "discountValue", BigDecimal.valueOf(50000));
        ReflectionTestUtils.setField(request, "pointsRequired", 50);
        return request;
    }

    @Test
    void adminCanCreateAndUpdatePointPrice() {
        when(repository.save(org.mockito.ArgumentMatchers.any(Voucher.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        VoucherServiceImpl service = new VoucherServiceImpl(repository);
        assertEquals(50, service.createVoucher(rewardRequest()).getPointsRequired());

        Voucher existing = new Voucher();
        existing.setId(7L);
        when(repository.findById(7L)).thenReturn(Optional.of(existing));
        VoucherRequest updated = rewardRequest();
        ReflectionTestUtils.setField(updated, "pointsRequired", 100);
        assertEquals(100, service.updateVoucher(7L, updated).getPointsRequired());
    }

    @Test
    void unusedVoucherCanBeDeleted() {
        Voucher voucher = new Voucher();
        when(repository.findById(4L)).thenReturn(Optional.of(voucher));
        new VoucherServiceImpl(repository).deleteVoucher(4L);
        verify(repository).delete(voucher);
    }

    @Test
    void assignedVoucherCannotBeDeleted() {
        Voucher voucher = new Voucher();
        voucher.setUserVouchers(List.of(new UserVoucher()));
        when(repository.findById(4L)).thenReturn(Optional.of(voucher));
        assertThrows(InvalidDataException.class,
                () -> new VoucherServiceImpl(repository).deleteVoucher(4L));
        verify(repository, never()).delete(voucher);
    }

    @Test
    void usedVoucherCannotBeDeleted() {
        Voucher voucher = new Voucher();
        voucher.setOrders(List.of(new Order()));
        when(repository.findById(4L)).thenReturn(Optional.of(voucher));
        assertThrows(InvalidDataException.class,
                () -> new VoucherServiceImpl(repository).deleteVoucher(4L));
        verify(repository, never()).delete(voucher);
    }
}

package com.crowndine.service.voucher;

import com.crowndine.exception.InvalidDataException;
import com.crowndine.model.Order;
import com.crowndine.model.UserVoucher;
import com.crowndine.model.Voucher;
import com.crowndine.repository.VoucherRepository;
import com.crowndine.service.impl.voucher.VoucherServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VoucherManagementServiceTest {
    @Mock
    VoucherRepository repository;

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

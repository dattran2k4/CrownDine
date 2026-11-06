package com.crowndine.service.user;

import com.crowndine.common.enums.EPointReason;
import com.crowndine.dto.request.VoucherAssignUsersRequest;
import com.crowndine.exception.InvalidDataException;
import com.crowndine.model.Order;
import com.crowndine.model.PointHistory;
import com.crowndine.model.User;
import com.crowndine.model.Voucher;
import com.crowndine.repository.OrderRepository;
import com.crowndine.repository.PointHistoryRepository;
import com.crowndine.repository.UserRepository;
import com.crowndine.repository.VoucherRepository;
import com.crowndine.service.impl.user.RewardPointServiceImpl;
import com.crowndine.service.voucher.UserVoucherService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RewardPointServiceTest {
    @Mock OrderRepository orders;
    @Mock UserRepository users;
    @Mock VoucherRepository vouchers;
    @Mock PointHistoryRepository histories;
    @Mock UserVoucherService userVouchers;
    @InjectMocks RewardPointServiceImpl service;

    @Test
    void paidOrderEarnsOnePointPerHundredThousandDong() {
        User user = new User();
        user.setRewardPoints(5);
        Order order = new Order();
        order.setUser(user);
        order.setFinalPrice(BigDecimal.valueOf(250000));
        when(orders.findById(7L)).thenReturn(Optional.of(order));

        service.addPointsFromOrder(7L);

        assertEquals(7, user.getRewardPoints());
        ArgumentCaptor<PointHistory> history = ArgumentCaptor.forClass(PointHistory.class);
        verify(histories).save(history.capture());
        assertEquals(2, history.getValue().getPointsChanged());
        assertEquals(EPointReason.EARN_FROM_ORDER, history.getValue().getReason());
        assertEquals(7L, history.getValue().getReferenceId());
    }

    @Test
    void exchangeDeductsPointsAndGrantsOneVoucherUse() {
        User user = new User();
        user.setId(3L);
        user.setUsername("customer");
        user.setRewardPoints(100);
        Voucher voucher = new Voucher();
        voucher.setPointsRequired(50);
        when(users.findByUsername("customer")).thenReturn(Optional.of(user));
        when(vouchers.findById(8L)).thenReturn(Optional.of(voucher));

        service.exchangeVoucher(8L, "customer");

        assertEquals(50, user.getRewardPoints());
        ArgumentCaptor<PointHistory> history = ArgumentCaptor.forClass(PointHistory.class);
        verify(histories).save(history.capture());
        assertEquals(-50, history.getValue().getPointsChanged());
        assertEquals(EPointReason.SPEND_ON_VOUCHER, history.getValue().getReason());
        ArgumentCaptor<VoucherAssignUsersRequest> grant = ArgumentCaptor.forClass(VoucherAssignUsersRequest.class);
        verify(userVouchers).assignUsers(org.mockito.ArgumentMatchers.eq(8L), grant.capture());
        assertEquals(3L, grant.getValue().getUserIds().get(0));
        assertEquals(1, grant.getValue().getUsageLimit());
    }

    @Test
    void insufficientPointsCannotGrantVoucher() {
        User user = new User();
        user.setRewardPoints(10);
        Voucher voucher = new Voucher();
        voucher.setPointsRequired(50);
        when(users.findByUsername("customer")).thenReturn(Optional.of(user));
        when(vouchers.findById(8L)).thenReturn(Optional.of(voucher));

        assertThrows(InvalidDataException.class,
                () -> service.exchangeVoucher(8L, "customer"));
        assertEquals(10, user.getRewardPoints());
        verify(userVouchers, never()).assignUsers(org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.any(VoucherAssignUsersRequest.class));
    }
}

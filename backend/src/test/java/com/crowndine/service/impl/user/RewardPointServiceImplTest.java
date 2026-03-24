package com.crowndine.service.impl.user;

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
import com.crowndine.service.voucher.UserVoucherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RewardPointServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private VoucherRepository voucherRepository;
    @Mock
    private PointHistoryRepository pointHistoryRepository;
    @Mock
    private UserVoucherService userVoucherService;

    @InjectMocks
    private RewardPointServiceImpl rewardPointService;

    private User user;
    private Order order;
    private Voucher voucher;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setRewardPoints(0);

        order = new Order();
        order.setId(10L);
        order.setUser(user);
        order.setFinalPrice(new BigDecimal("250000")); // Should give 2 points

        voucher = new Voucher();
        voucher.setId(100L);
        voucher.setPointsRequired(50);
    }

    @Test
    void addPointsFromOrder_ValidOrder_AddsPoints() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        rewardPointService.addPointsFromOrder(10L);

        assertEquals(2, user.getRewardPoints());
        verify(userRepository, times(1)).save(user);

        ArgumentCaptor<PointHistory> historyCaptor = ArgumentCaptor.forClass(PointHistory.class);
        verify(pointHistoryRepository, times(1)).save(historyCaptor.capture());
        
        PointHistory savedHistory = historyCaptor.getValue();
        assertEquals(user, savedHistory.getUser());
        assertEquals(2, savedHistory.getPointsChanged());
        assertEquals(EPointReason.EARN_FROM_ORDER, savedHistory.getReason());
        assertEquals(10L, savedHistory.getReferenceId());
    }

    @Test
    void exchangeVoucher_EnoughPoints_Success() {
        user.setRewardPoints(100);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(voucherRepository.findById(100L)).thenReturn(Optional.of(voucher));

        rewardPointService.exchangeVoucher(100L, "testuser");

        assertEquals(50, user.getRewardPoints());
        verify(userRepository, times(1)).save(user);

        ArgumentCaptor<PointHistory> historyCaptor = ArgumentCaptor.forClass(PointHistory.class);
        verify(pointHistoryRepository, times(1)).save(historyCaptor.capture());
        
        PointHistory savedHistory = historyCaptor.getValue();
        assertEquals(user, savedHistory.getUser());
        assertEquals(-50, savedHistory.getPointsChanged());
        assertEquals(EPointReason.SPEND_ON_VOUCHER, savedHistory.getReason());
        assertEquals(100L, savedHistory.getReferenceId());

        verify(userVoucherService, times(1)).assignUsers(eq(100L), any(VoucherAssignUsersRequest.class));
    }

    @Test
    void exchangeVoucher_NotEnoughPoints_ThrowsException() {
        user.setRewardPoints(10); // Needs 50
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(voucherRepository.findById(100L)).thenReturn(Optional.of(voucher));

        assertThrows(InvalidDataException.class, () -> rewardPointService.exchangeVoucher(100L, "testuser"));
    }
}

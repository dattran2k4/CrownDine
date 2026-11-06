package com.crowndine.service.user;

import com.crowndine.common.enums.ERole;
import com.crowndine.model.Role;
import com.crowndine.model.User;
import com.crowndine.repository.UserRepository;
import com.crowndine.service.impl.user.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserProfileRoleTest {
    @Mock
    UserRepository repository;

    @Test
    void adminRoleWinsOverStaffAndUser() {
        User user = userWithRoles(ERole.USER, ERole.STAFF, ERole.ADMIN);
        when(repository.findByUsername("admin")).thenReturn(Optional.of(user));
        assertEquals("ADMIN", new UserServiceImpl(repository, null, null, null)
                .getProfile("admin").getRole());
    }

    @Test
    void staffRoleWinsOverUser() {
        User user = userWithRoles(ERole.USER, ERole.STAFF);
        when(repository.findByUsername("staff")).thenReturn(Optional.of(user));
        assertEquals("STAFF", new UserServiceImpl(repository, null, null, null)
                .getProfile("staff").getRole());
    }

    private User userWithRoles(ERole... names) {
        User user = new User();
        user.setId(1L);
        user.setUsername("test");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        Set<Role> roles = new HashSet<>();
        for (ERole name : names) {
            Role role = new Role();
            role.setName(name);
            roles.add(role);
        }
        user.setRoles(roles);
        return user;
    }
}

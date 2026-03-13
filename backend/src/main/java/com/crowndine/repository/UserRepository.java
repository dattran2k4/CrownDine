package com.crowndine.repository;

import com.crowndine.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = { "roles" })
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phonenumber);

    Optional<User> findByVerificationCode(String verificationCode);

    @Query("""
                SELECT DISTINCT u
                FROM User u
                JOIN u.roles r
                WHERE r.name = com.crowndine.common.enums.ERole.STAFF
                  AND (:name IS NULL
                       OR LOWER(u.username) LIKE LOWER(CONCAT('%', :name, '%')))
            """)
    Page<User> searchStaffByName(String name, Pageable pageable);

    @Query("""
                SELECT DISTINCT u
                FROM User u
                JOIN FETCH u.roles r
                WHERE r.name = com.crowndine.common.enums.ERole.STAFF
            """)
    java.util.List<User> findAllStaffs();

}

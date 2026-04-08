package com.crowndine.core.repository;

import com.crowndine.core.entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long> {
    java.util.Optional<Combo> findByName(String name);
}

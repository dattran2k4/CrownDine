package com.crowndine.core.repository;

import com.crowndine.core.entity.Favorite;
import com.crowndine.core.entity.User;
import com.crowndine.core.entity.Item;
import com.crowndine.core.entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findAllByUser(User user);
    Optional<Favorite> findByUserAndItem(User user, Item item);
    Optional<Favorite> findByUserAndCombo(User user, Combo combo);
    boolean existsByUserAndItem(User user, Item item);
    boolean existsByUserAndCombo(User user, Combo combo);
}

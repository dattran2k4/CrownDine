package com.crowndine.repository;

import com.crowndine.model.Favorite;
import com.crowndine.model.User;
import com.crowndine.model.Item;
import com.crowndine.model.Combo;
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

package com.example.demo.repository;

import com.example.demo.model.Achievement;
import com.example.demo.model.User;
import com.example.demo.model.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAchievementRepository
        extends JpaRepository<UserAchievement, Long> {

    Optional<UserAchievement> findByUserAndAchievement(
            User user,
            Achievement achievement
    );

    List<UserAchievement> findByUser(User user);
}
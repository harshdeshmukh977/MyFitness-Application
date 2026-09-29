package com.example.demo.service;

import com.example.demo.dto.AchievementResponse;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AchievementService {
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final WorkoutSessionRepository workoutRepository;

    public AchievementService(AchievementRepository achievementRepository,
                              UserAchievementRepository userAchievementRepository,
                              WorkoutSessionRepository workoutRepository) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.workoutRepository = workoutRepository;
    }

    @Transactional
    public void updateAchievements(User user) {
        int workoutCount = (int) workoutRepository.countByUserAndStatus(user, "COMPLETED");
        int streak = calculateCurrentStreak(user);

        update(user, "FIRST_WORKOUT", workoutCount, workoutCount >= 1);
        update(user, "MOMENTUM", Math.min(workoutCount, 10), workoutCount >= 10);
        update(user, "CONSISTENCY", Math.min(streak, 7), streak >= 7);
        update(user, "DEDICATED", Math.min(streak, 30), streak >= 30);
    }

    @Transactional
    public List<AchievementResponse> getAchievements(User user) {
        updateAchievements(user);
        return achievementRepository.findAll().stream().map(a -> {
            UserAchievement ua = userAchievementRepository.findByUserAndAchievement(user, a).orElse(null);
            int progress = ua == null ? 0 : ua.getProgress();
            boolean unlocked = ua != null && ua.isUnlocked();
            return new AchievementResponse(a.getCode(), a.getName(), a.getDescription(), a.getIcon(), progress, a.getTarget(), unlocked);
        }).toList();
    }

    public int calculateCurrentStreak(User user) {
        List<WorkoutSession> sessions = workoutRepository.findByUserAndStatusOrderByWorkoutDateDescCreatedAtDesc(user, "COMPLETED");
        Set<java.time.LocalDate> dates = new HashSet<>();
        sessions.forEach(s -> dates.add(s.getWorkoutDate()));
        if (dates.isEmpty()) return 0;

        java.time.LocalDate cursor = java.time.LocalDate.now();
        if (!dates.contains(cursor)) {
            cursor = cursor.minusDays(1);
            if (!dates.contains(cursor)) return 0;
        }

        int streak = 0;
        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private void update(User user, String code, int progress, boolean unlocked) {
        Achievement achievement = achievementRepository.findByCode(code)
                .orElseThrow(() -> new IllegalStateException("Missing achievement seed: " + code));
        UserAchievement ua = userAchievementRepository.findByUserAndAchievement(user, achievement)
                .orElseGet(() -> {
                    UserAchievement created = new UserAchievement();
                    created.setUser(user);
                    created.setAchievement(achievement);
                    return created;
                });
        boolean wasUnlocked = ua.isUnlocked();
        ua.setProgress(Math.min(progress, achievement.getTarget()));
        ua.setUnlocked(unlocked);
        if (unlocked && !wasUnlocked) ua.setUnlockedAt(LocalDateTime.now());
        userAchievementRepository.save(ua);
    }
}

package com.example.demo.service;

import com.example.demo.dto.WorkoutRequest;
import com.example.demo.model.User;
import com.example.demo.model.WorkoutSession;
import com.example.demo.repository.WorkoutSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class WorkoutService {
    private final WorkoutSessionRepository workoutRepository;
    private final AchievementService achievementService;

    public WorkoutService(WorkoutSessionRepository workoutRepository, AchievementService achievementService) {
        this.workoutRepository = workoutRepository;
        this.achievementService = achievementService;
    }

    @Transactional
    public WorkoutSession completeWorkout(User user, WorkoutRequest request) {
        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setWorkoutDate(request.getWorkoutDate() == null ? LocalDate.now() : request.getWorkoutDate());
        session.setExerciseCount(request.getExerciseCount() == null ? 0 : request.getExerciseCount());
        session.setDuration(request.getDuration() == null ? 0 : request.getDuration());
        session.setCalories(request.getCalories() == null ? 0 : request.getCalories());
        session.setStatus("COMPLETED");
        WorkoutSession saved = workoutRepository.save(session);
        achievementService.updateAchievements(user);
        return saved;
    }
}

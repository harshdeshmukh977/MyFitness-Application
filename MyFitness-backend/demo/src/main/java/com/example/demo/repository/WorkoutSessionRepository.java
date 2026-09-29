package com.example.demo.repository;

import com.example.demo.model.User;
import com.example.demo.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutSessionRepository
        extends JpaRepository<WorkoutSession, Long> {

    List<WorkoutSession> findByUserAndStatusOrderByWorkoutDateDescCreatedAtDesc(
            User user,
            String status
    );

    List<WorkoutSession>
    findByUserAndStatusAndWorkoutDateBetweenOrderByWorkoutDateAsc(
            User user,
            String status,
            LocalDate from,
            LocalDate to
    );

    long countByUserAndStatus(
            User user,
            String status
    );

    boolean existsByUserAndStatusAndWorkoutDate(
            User user,
            String status,
            LocalDate date
    );
}
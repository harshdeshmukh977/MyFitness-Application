package com.example.demo.service;

import com.example.demo.dto.WeeklyDayResponse;
import com.example.demo.dto.WeeklyProgressResponse;
import com.example.demo.model.User;
import com.example.demo.model.WorkoutSession;
import com.example.demo.repository.WorkoutSessionRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class WeeklyProgressService {
    private final WorkoutSessionRepository repository;

    public WeeklyProgressService(WorkoutSessionRepository repository) { this.repository = repository; }

    public WeeklyProgressResponse getCurrentWeek(User user) {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);
        List<WorkoutSession> sessions = repository.findByUserAndStatusAndWorkoutDateBetweenOrderByWorkoutDateAsc(user, "COMPLETED", monday, sunday);

        Map<LocalDate, List<WorkoutSession>> grouped = new HashMap<>();
        sessions.forEach(s -> grouped.computeIfAbsent(s.getWorkoutDate(), k -> new ArrayList<>()).add(s));

        List<WeeklyDayResponse> days = new ArrayList<>();
        int workouts = sessions.size();
        int duration = 0;
        int calories = 0;
        int completedDays = 0;

        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);
            List<WorkoutSession> list = grouped.getOrDefault(date, List.of());
            boolean completed = !list.isEmpty();
            if (completed) completedDays++;
            int dayDuration = list.stream().mapToInt(s -> s.getDuration() == null ? 0 : s.getDuration()).sum();
            int dayCalories = list.stream().mapToInt(s -> s.getCalories() == null ? 0 : s.getCalories()).sum();
            duration += dayDuration;
            calories += dayCalories;
            days.add(new WeeklyDayResponse(
                    date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase(),
                    date.toString(), completed, dayCalories, dayDuration));
        }

        int completion = Math.round((completedDays / 7f) * 100f);
        return new WeeklyProgressResponse(completion, workouts, duration / 60.0, calories, days);
    }
}

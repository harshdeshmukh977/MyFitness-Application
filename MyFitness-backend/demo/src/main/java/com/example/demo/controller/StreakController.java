package com.example.demo.controller;

import com.example.demo.dto.CurrentStreakResponse;
import com.example.demo.service.AchievementService;
import com.example.demo.util.CurrentUserService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:5173")
public class StreakController {
    private final AchievementService achievementService;
    private final CurrentUserService currentUserService;

    public StreakController(AchievementService achievementService, CurrentUserService currentUserService) {
        this.achievementService = achievementService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/streak")
    public CurrentStreakResponse streak() {
        int days = achievementService.calculateCurrentStreak(currentUserService.getRequiredUser());
        LocalDate date = LocalDate.now();
        return new CurrentStreakResponse(days, date.getDayOfWeek().name().substring(0, 3), date.toString());
    }
}

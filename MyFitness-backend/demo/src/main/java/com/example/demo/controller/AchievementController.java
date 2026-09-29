package com.example.demo.controller;

import com.example.demo.dto.AchievementResponse;
import com.example.demo.service.AchievementService;
import com.example.demo.util.CurrentUserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "http://localhost:5173")
public class AchievementController {

    private final AchievementService achievementService;
    private final CurrentUserService currentUserService;

    public AchievementController(
            AchievementService achievementService,
            CurrentUserService currentUserService) {

        this.achievementService = achievementService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<AchievementResponse> getAchievements() {

        return achievementService.getAchievements(
                currentUserService.getRequiredUser()
        );
    }
}
package com.example.demo.controller;

import com.example.demo.dto.WeeklyProgressResponse;
import com.example.demo.service.WeeklyProgressService;
import com.example.demo.util.CurrentUserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:5173")
public class ProgressController {
    private final WeeklyProgressService progressService;
    private final CurrentUserService currentUserService;

    public ProgressController(WeeklyProgressService progressService, CurrentUserService currentUserService) {
        this.progressService = progressService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/weekly")
    public WeeklyProgressResponse weekly() {
        return progressService.getCurrentWeek(currentUserService.getRequiredUser());
    }
}

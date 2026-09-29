package com.example.demo.controller;

import com.example.demo.dto.WorkoutRequest;
import com.example.demo.model.WorkoutSession;
import com.example.demo.service.WorkoutService;
import com.example.demo.util.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutController {
    private final WorkoutService workoutService;
    private final CurrentUserService currentUserService;

    public WorkoutController(WorkoutService workoutService, CurrentUserService currentUserService) {
        this.workoutService = workoutService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<WorkoutSession> complete(@Valid @RequestBody WorkoutRequest request) {
        return ResponseEntity.ok(workoutService.completeWorkout(currentUserService.getRequiredUser(), request));
    }
}

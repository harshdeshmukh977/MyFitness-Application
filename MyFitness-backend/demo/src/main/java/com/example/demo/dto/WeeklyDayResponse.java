package com.example.demo.dto;

import java.util.List;

public record WeeklyProgressResponse(int completionPercent, int workouts, double hours, int calories, List<WeeklyDayResponse> days) {}

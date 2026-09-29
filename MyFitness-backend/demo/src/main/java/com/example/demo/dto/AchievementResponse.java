package com.example.demo.dto;

public record AchievementResponse(
        String code,
        String name,
        String description,
        String icon,
        int progress,
        int target,
        boolean unlocked
) {
}
package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import java.time.LocalDate;

public class WorkoutRequest {
    private LocalDate workoutDate;
    @Min(0) private Integer exerciseCount = 0;
    @Min(0) private Integer duration = 0;
    @Min(0) private Integer calories = 0;

    public LocalDate getWorkoutDate() { return workoutDate; }
    public void setWorkoutDate(LocalDate workoutDate) { this.workoutDate = workoutDate; }
    public Integer getExerciseCount() { return exerciseCount; }
    public void setExerciseCount(Integer exerciseCount) { this.exerciseCount = exerciseCount; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }
}

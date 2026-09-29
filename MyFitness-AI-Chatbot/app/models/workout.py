"""Workout plan and request/response models."""
from pydantic import BaseModel, Field

from .common import FitnessLevel, FitnessGoal, MuscleGroup
from .user import UserFitnessContext


class WorkoutExerciseStep(BaseModel):
    """A single prescribed exercise within a workout plan."""

    exercise_id: str
    name: str
    sets: int = Field(ge=1, le=20)
    reps: str = Field(description='Rep target, e.g. "8-12" or "AMRAP"')
    rest_seconds: int = Field(ge=0, le=600)
    notes: str | None = None


class WorkoutPlan(BaseModel):
    """A complete workout prescription."""

    name: str
    goal: FitnessGoal
    fitness_level: FitnessLevel
    estimated_duration_minutes: int = Field(ge=5, le=300)
    exercises: list[WorkoutExerciseStep]
    warmup: list[str] = Field(default_factory=list)
    cooldown: list[str] = Field(default_factory=list)


class WorkoutSuggestRequest(BaseModel):
    """Request body for POST /api/v1/workouts/suggest."""

    user_context: UserFitnessContext
    focus_area: MuscleGroup | None = None
    target_duration_minutes: int = Field(default=45, ge=15, le=120)


class WorkoutSuggestResponse(BaseModel):
    """Response body for POST /api/v1/workouts/suggest."""

    workout: WorkoutPlan
    ai_tips: str
    knowledge_sources: list[str] = Field(default_factory=list)

"""Workout, rep-counter, and pose-detection feedback models."""
from pydantic import BaseModel, Field

from .user import UserFitnessContext


class TempoMetrics(BaseModel):
    """Pacing and cadence metrics from computer vision or timer."""

    rep_duration_seconds: float | None = Field(default=None, ge=0)
    eccentric_seconds: float | None = Field(default=None, ge=0)
    concentric_seconds: float | None = Field(default=None, ge=0)
    pause_seconds: float | None = Field(default=None, ge=0)


class SessionMetrics(BaseModel):
    """Aggregated metrics for the workout session."""

    duration_minutes: int | None = Field(default=None, ge=0)
    total_sets: int | None = Field(default=None, ge=0)
    total_reps: int | None = Field(default=None, ge=0)
    perceived_exertion_rpe: float | None = Field(
        default=None, ge=1, le=10, description="Rating of Perceived Exertion (1-10)"
    )
    calories_burned_est: int | None = Field(default=None, ge=0)


class PreviousSessionSummary(BaseModel):
    """Historical performance log entry for the exercise."""

    date: str | None = Field(default=None, description="Date of past session, e.g. '2026-08-25'")
    sets: int = Field(ge=1, description="Number of sets performed")
    reps_completed: int = Field(ge=0, description="Total reps completed in the past session")
    weight_kg: float | None = Field(default=None, ge=0, description="Weight used in kg if applicable")
    form_accuracy: float | None = Field(default=None, ge=0, le=100, description="Form accuracy score percentage")


class WorkoutFeedbackRequest(BaseModel):
    """Request payload for POST /api/v1/feedback/workout."""

    user_context: UserFitnessContext | None = None
    exercise_id: str = Field(description="Unique exercise identifier, e.g. 'bodyweight_squat'")
    exercise_name: str | None = Field(default=None, description="Optional human-readable exercise name")
    target_reps: int = Field(ge=1, description="Target reps prescribed for the set")
    completed_reps: int = Field(ge=0, description="Reps counted by computer vision or entered by user")
    sets: int = Field(default=1, ge=1, description="Set number or total sets performed")
    weight_kg: float | None = Field(default=None, ge=0, description="Optional weight used in kilograms")
    form_accuracy: float | None = Field(
        default=None, ge=0, le=100, description="Form accuracy score percentage (0-100)"
    )
    detected_faults: list[str] = Field(
        default_factory=list,
        description="Form faults detected by pose analysis (e.g. ['insufficient_depth', 'excessive_forward_lean'])",
    )
    tempo: TempoMetrics | None = None
    session_metrics: SessionMetrics | None = None
    previous_history: list[PreviousSessionSummary] = Field(
        default_factory=list, description="Past workout logs for this exercise"
    )


class WorkoutFeedbackResponse(BaseModel):
    """Structured response payload for POST /api/v1/feedback/workout."""

    overall_feedback: str = Field(description="High-level performance summary and encouragement")
    performance_feedback: str = Field(description="Rep target completion and volume evaluation")
    form_feedback: str = Field(description="Pose analysis, form faults assessment, and biomechanical corrections")
    progression_feedback: str = Field(description="Comparison against previous workout history")
    actionable_tips: list[str] = Field(
        default_factory=list, description="Immediate actionable coaching cues for the next set or session"
    )
    safety_disclaimer: str = Field(description="Medical and safety advisory")
    sources: list[str] = Field(default_factory=list, description="Knowledge base sources consulted")

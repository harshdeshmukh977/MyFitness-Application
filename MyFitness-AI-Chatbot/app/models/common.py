"""Shared primitives: enums and the standard error detail model."""
from enum import Enum
from pydantic import BaseModel, Field


class FitnessLevel(str, Enum):
    """User's self-reported training experience."""

    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class FitnessGoal(str, Enum):
    """High-level goal the user is working toward."""

    BUILD_MUSCLE = "build_muscle"
    LOSE_WEIGHT = "lose_weight"
    MAINTAIN = "maintain"
    IMPROVE_ENDURANCE = "improve_endurance"


class MuscleGroup(str, Enum):
    """Primary muscle group a workout or exercise targets."""

    CHEST = "chest"
    BACK = "back"
    LEGS = "legs"
    SHOULDERS = "shoulders"
    ARMS = "arms"
    CORE = "core"
    FULL_BODY = "full_body"


class Difficulty(str, Enum):
    """Skill / strength level required for an exercise."""

    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ErrorDetail(BaseModel):
    """Standard error payload returned in APIError responses."""

    code: str = Field(description="Stable machine-readable code, e.g. 'VALIDATION_ERROR'")
    message: str = Field(description="Human-readable summary of the error")
    field: str | None = Field(default=None, description="Optional field path that triggered the error")

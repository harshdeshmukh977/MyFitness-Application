"""Exercise data models."""
from pydantic import BaseModel, Field

from .common import MuscleGroup, Difficulty


class Exercise(BaseModel):
    """Single exercise entry from the knowledge base.

    Attributes
    ----------
    id:
        Unique machine-readable identifier, e.g. "barbell_bench_press".
    name:
        Human-readable display name, e.g. "Barbell Bench Press".
    aliases:
        Common alternative names or search keywords.
    muscle_groups:
        All muscle groups engaged by the exercise.
    equipment:
        Equipment required (empty list = bodyweight only).
    difficulty:
        Minimum experience level recommended.
    instructions:
        Ordered step-by-step execution guide.
    common_mistakes:
        Typical errors to avoid.
    modifications:
        Fallback suggestions keyed by context, e.g.
        {"beginner": "Dumbbell Bench Press", "no_equipment": "Push-ups"}.
    tips:
        Optional coaching cues for better execution.
    """

    id: str
    name: str
    aliases: list[str] = Field(default_factory=list)
    muscle_groups: list[MuscleGroup | str]
    equipment: list[str] = Field(default_factory=list)
    difficulty: Difficulty
    instructions: list[str] = Field(min_length=1)
    common_mistakes: list[str] = Field(default_factory=list)
    modifications: dict[str, str] = Field(default_factory=dict)
    tips: list[str] = Field(default_factory=list)


class ExerciseListResponse(BaseModel):
    """Paginated / filtered list of exercises."""

    exercises: list[Exercise]
    total: int
    filters_applied: dict[str, str] = Field(default_factory=dict)

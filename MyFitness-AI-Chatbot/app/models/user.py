"""User fitness profile / context models."""
from pydantic import BaseModel, Field, model_validator

from .common import FitnessLevel, FitnessGoal


class UserFitnessContext(BaseModel):
    """Snapshot of a user's fitness state.

    Reusable as a sub-document in chat, workout, and meal-plan requests.
    Designed to match the structure Harsh's backend will send later.

    Attributes
    ----------
    user_id:
        Opaque identifier from the calling system. Optional until
        integration with the main backend is complete.
    fitness_level:
        The user's own assessment of their training experience.
    goals:
        One or more goals the user is currently pursuing.
    available_equipment:
        Equipment the user has regular access to
        (e.g. ["dumbbells", "barbell", "pull-up bar"]).
    dietary_restrictions:
        Dietary labels or allergens to honour in meal planning
        (e.g. ["vegetarian", "gluten_free", "nut allergy"]).
    safety_limitations:
        Brief safety tags (e.g. "lower back", "knees") intended only
        as lightweight limitations for exercise selection.
        This field is NOT a medical-notes store — it must not contain
        detailed clinical information.
    preferences:
        Arbitrary key-value pairs for future extension
        (e.g. {"preferred_unit": "metric"}).
    """

    user_id: str | None = None
    fitness_level: FitnessLevel | None = None
    goals: list[FitnessGoal] = Field(default_factory=list)
    available_equipment: list[str] = Field(default_factory=list)
    dietary_restrictions: list[str] = Field(default_factory=list)
    safety_limitations: list[str] = Field(
        default_factory=list,
        description=(
            "Brief safety tags (e.g. 'lower back', 'knees'). "
            "NOT a medical-notes store. Each entry is capped at 60 characters."
        ),
    )
    preferences: dict[str, str] = Field(default_factory=dict)

    @model_validator(mode="before")
    @classmethod
    def _limit_safety_tag_length(cls, data: object) -> object:
        if isinstance(data, dict) and "safety_limitations" in data:
            tags = data["safety_limitations"]
            if isinstance(tags, list):
                for tag in tags:
                    if isinstance(tag, str) and len(tag) > 60:
                        raise ValueError(f"Safety tag '{tag}' exceeds 60-character limit.")
        return data

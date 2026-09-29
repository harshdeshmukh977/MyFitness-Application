"""Nutrition / meal plan models.

Calorie values are stored as plain positive integers and are NOT bounded
to a clinical or personalised range. This module focuses on foods, meals,
macros, dietary preferences, and general nutrition guidance.
"""
from pydantic import BaseModel, Field, model_validator

from .user import UserFitnessContext


class Macros(BaseModel):
    """Macronutrient breakdown in grams."""

    protein_grams: float = Field(ge=0)
    carbs_grams: float = Field(ge=0)
    fat_grams: float = Field(ge=0)


class Food(BaseModel):
    """A single food item from the nutrition knowledge base."""

    id: str
    name: str
    category: str = Field(description="protein | carbs | fats | vegetables | fruit | other")
    serving_size: str = Field(description='Human-readable serving, e.g. "100g" or "1 medium banana"')
    calories: int = Field(ge=0)
    macros: Macros
    dietary_tags: list[str] = Field(
        default_factory=list,
        description='Dietary labels, e.g. ["vegetarian", "vegan", "gluten_free"]',
    )


class FoodListResponse(BaseModel):
    """Filtered / searched list of foods."""

    foods: list[Food]
    total: int


class Meal(BaseModel):
    """A single meal entry within a MealPlan."""

    meal_type: str = Field(description="breakfast | lunch | dinner | snack")
    name: str
    ingredients: list[str]
    calories: int = Field(ge=0)
    macros: Macros
    notes: str | None = None


class MealPlan(BaseModel):
    """A full day of meals."""

    daily_calories: int = Field(ge=0)
    target_macros: Macros
    meals: list[Meal]
    dietary_notes: list[str] = Field(default_factory=list)


class MealPlanRequest(BaseModel):
    """Request body for POST /api/v1/nutrition/meal-plan.

    No hard calorie range is enforced. ``daily_calories`` and
    ``macro_split`` are treated as informational guidance from the
    caller (e.g. Harsh's backend). ``macro_split`` values, if
    provided, are percentages and must sum to 100.
    """

    user_context: UserFitnessContext
    daily_calories: int | None = Field(
        default=None,
        ge=0,
        description="Optional, caller-supplied calorie target. No upper bound enforced.",
    )
    macro_split: dict[str, int] | None = Field(
        default=None,
        description='Optional percentage split, e.g. {"protein": 30, "carbs": 40, "fat": 30}. Must sum to 100 when provided.',
    )
    meals_per_day: int = Field(default=3, ge=2, le=6)

    @model_validator(mode="after")
    def _validate_macro_split(self) -> "MealPlanRequest":
        if self.macro_split is None:
            return self

        if not self.macro_split:
            raise ValueError("macro_split must not be empty when provided.")

        for key, value in self.macro_split.items():
            if value < 0:
                raise ValueError(f"macro_split['{key}'] must be non-negative.")

        total = sum(self.macro_split.values())
        if total != 100:
            raise ValueError(
                f"macro_split values must sum to 100 (got {total})."
            )
        return self


class MealPlanResponse(BaseModel):
    """Response body for POST /api/v1/nutrition/meal-plan."""

    meal_plan: MealPlan
    ai_tips: str

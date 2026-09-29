"""Knowledge base loader.

Loads and validates all JSON knowledge files from the knowledge/ directory.
All data is read once and cached in memory. This module is read-only,
deterministic, and has no external dependencies (no DB, no API, no RAG).
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, Field, ConfigDict

# ---------------------------------------------------------------------------
# Internal DTO models (not exported; used only for validation)
# ---------------------------------------------------------------------------

_ALLOWED_DIFFICULTIES = {"beginner", "intermediate", "advanced"}
_ALLOWED_MUSCLE_GROUPS = {
    "chest", "back", "legs", "shoulders", "arms",
    "core", "full_body", "abs",
}
_ALLOWED_CATEGORIES = {
    "workout", "nutrition", "goal", "general",
}
_ALLOWED_MEAL_TYPES = {
    "breakfast", "lunch", "dinner", "snack",
}
_ALLOWED_FOOD_CATEGORIES = {
    "protein", "carbs", "vegetables", "fruit", "fats", "dairy", "beverage",
}
_ALLOWED_GOALS = {
    "build_muscle", "lose_weight", "maintain", "improve_endurance",
}


class _MacrosTemplate(BaseModel):
    model_config = ConfigDict(extra="allow")

    protein_grams: float = Field(ge=0)
    carbs_grams: float = Field(ge=0)
    fat_grams: float = Field(ge=0)


class _ExerciseTemplate(BaseModel):
    """Internal DTO for exercise validation."""

    model_config = ConfigDict(extra="allow")

    id: str
    name: str
    aliases: list[str] = Field(default_factory=list)
    muscle_groups: list[str]
    equipment: list[str] = Field(default_factory=list)
    difficulty: str
    instructions: list[str]
    common_mistakes: list[str] = Field(default_factory=list)
    modifications: dict[str, str] = Field(default_factory=dict)
    tips: list[str] = Field(default_factory=list)


class _WorkoutExerciseTemplate(BaseModel):
    """Internal DTO for workout template validation."""

    model_config = ConfigDict(extra="allow")

    exercise_id: str
    name: str
    sets: int = Field(ge=1, le=20)
    reps: str
    rest_seconds: int = Field(ge=0, le=600)
    notes: str | None = None


class _WorkoutTemplate(BaseModel):
    """Internal DTO for workout validation."""

    model_config = ConfigDict(extra="allow")

    id: str
    name: str
    description: str = ""
    goal: str
    fitness_level: str
    focus_area: str | None = None
    estimated_duration_minutes: int = Field(ge=5, le=300)
    exercise_ids: list[str]
    warmup: list[str] = Field(default_factory=list)
    cooldown: list[str] = Field(default_factory=list)


class _FoodTemplate(BaseModel):
    """Internal DTO for food validation."""

    model_config = ConfigDict(extra="allow")

    id: str
    name: str
    category: str
    serving_size: str
    calories: int = Field(ge=0)
    macros: _MacrosTemplate
    dietary_tags: list[str] = Field(default_factory=list)


class _MealIngredientTemplate(BaseModel):
    """Internal DTO for meal ingredient (stored as string in JSON)."""

    model_config = ConfigDict(extra="allow")


class _MealTemplate(BaseModel):
    """Internal DTO for meal validation."""

    model_config = ConfigDict(extra="allow")

    id: str
    name: str
    meal_type: str
    ingredients: list[str]
    instructions: list[str] = Field(default_factory=list)
    calories: int = Field(ge=0)
    macros: _MacrosTemplate
    dietary_tags: list[str] = Field(default_factory=list)


class _GuidelineTopic(BaseModel):
    """Internal DTO for guideline topic validation."""

    model_config = ConfigDict(extra="allow")

    id: str
    title: str
    category: str
    priority: int = 0
    content: str


# ---------------------------------------------------------------------------
# Loader class
# ---------------------------------------------------------------------------

class KnowledgeLoader:
    """Loads and validates all knowledge JSON files.

    All data is read and cached on first access. Validation errors
    raise ``ValueError`` so bad knowledge data is caught at startup.

    Parameters
    ----------
    knowledge_dir:
        Path to the knowledge/ directory. Defaults to <project>/knowledge/.
    """

    def __init__(self, knowledge_dir: Path | None = None) -> None:
        if knowledge_dir is None:
            # Resolve relative to this file's location
            self._dir = Path(__file__).parent.parent.parent / "knowledge"
        else:
            self._dir = Path(knowledge_dir)

        self._cache: dict[str, Any] = {}

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load_json(self, filename: str) -> Any:
        """Load and cache a JSON file. Raises ``FileNotFoundError`` if missing."""
        if filename in self._cache:
            return self._cache[filename]

        path = self._dir / filename
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)

        self._cache[filename] = data
        return data

    def _resolve_nutrition_path(self, filename: str) -> Path:
        """Return path for files inside knowledge/nutrition/."""
        return self._dir / "nutrition" / filename

    def _load_nutrition_json(self, filename: str) -> Any:
        """Load a JSON file from knowledge/nutrition/, with caching."""
        if filename in self._cache:
            return self._cache[filename]

        path = self._resolve_nutrition_path(filename)
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)

        self._cache[filename] = data
        return data

    # ------------------------------------------------------------------
    # Exercises
    # ------------------------------------------------------------------

    def get_all_exercises(self) -> list[dict]:
        """Return all exercises as validated dicts."""
        raw = self._load_json("exercises.json")
        items = raw.get("exercises", [])
        return [_ExerciseTemplate.model_validate(e).model_dump() for e in items]

    def get_exercise_by_id(self, exercise_id: str) -> dict | None:
        """Return a single exercise by ID, or None."""
        for ex in self.get_all_exercises():
            if ex["id"] == exercise_id:
                return ex
        return None

    def filter_exercises(
        self,
        muscle_group: str | None = None,
        equipment: str | None = None,
        difficulty: str | None = None,
    ) -> list[dict]:
        """Return exercises matching all provided filters."""
        results = self.get_all_exercises()

        if muscle_group is not None:
            results = [
                e for e in results
                if muscle_group in e.get("muscle_groups", [])
            ]

        if equipment is not None:
            results = [
                e for e in results
                if equipment in e.get("equipment", [])
            ]

        if difficulty is not None:
            results = [e for e in results if e.get("difficulty") == difficulty]

        return results

    # ------------------------------------------------------------------
    # Workouts
    # ------------------------------------------------------------------

    def get_all_workouts(self) -> list[dict]:
        """Return all workout templates as validated dicts."""
        raw = self._load_json("workouts.json")
        items = raw.get("workouts", [])
        return [_WorkoutTemplate.model_validate(w).model_dump() for w in items]

    def get_workout_by_id(self, workout_id: str) -> dict | None:
        """Return a single workout template by ID, or None."""
        for w in self.get_all_workouts():
            if w["id"] == workout_id:
                return w
        return None

    def filter_workouts(
        self,
        goal: str | None = None,
        fitness_level: str | None = None,
        focus_area: str | None = None,
    ) -> list[dict]:
        """Return workouts matching all provided filters."""
        results = self.get_all_workouts()

        if goal is not None:
            results = [w for w in results if w.get("goal") == goal]

        if fitness_level is not None:
            results = [w for w in results if w.get("fitness_level") == fitness_level]

        if focus_area is not None:
            results = [w for w in results if w.get("focus_area") == focus_area]

        return results

    def validate_workout_exercise_ids(self) -> list[str]:
        """Return list of exercise IDs referenced in workouts but not found in exercise list.

        Empty list means all workout exercise_ids resolve to real exercises.
        """
        exercise_ids = {e["id"] for e in self.get_all_exercises()}
        missing: list[str] = []
        for w in self.get_all_workouts():
            for eid in w.get("exercise_ids", []):
                if eid not in exercise_ids:
                    missing.append(f"workout '{w['id']}' references missing exercise_id '{eid}'")
        return missing

    # ------------------------------------------------------------------
    # Foods
    # ------------------------------------------------------------------

    def get_all_foods(self) -> list[dict]:
        """Return all foods as validated dicts."""
        raw = self._load_nutrition_json("foods.json")
        items = raw.get("foods", [])
        return [_FoodTemplate.model_validate(f).model_dump() for f in items]

    def get_food_by_id(self, food_id: str) -> dict | None:
        """Return a single food by ID, or None."""
        for f in self.get_all_foods():
            if f["id"] == food_id:
                return f
        return None

    def filter_foods(
        self,
        category: str | None = None,
        search: str | None = None,
        dietary_tag: str | None = None,
    ) -> list[dict]:
        """Return foods matching all provided filters."""
        results = self.get_all_foods()

        if category is not None:
            results = [f for f in results if f.get("category") == category]

        if search is not None:
            term = search.lower()
            results = [
                f for f in results
                if term in f.get("name", "").lower()
                or term in f.get("id", "").lower()
            ]

        if dietary_tag is not None:
            results = [
                f for f in results
                if dietary_tag in f.get("dietary_tags", [])
            ]

        return results

    # ------------------------------------------------------------------
    # Meals
    # ------------------------------------------------------------------

    def get_all_meals(self) -> list[dict]:
        """Return all meal templates as validated dicts."""
        raw = self._load_nutrition_json("meals.json")
        items = raw.get("meals", [])
        return [_MealTemplate.model_validate(m).model_dump() for m in items]

    def get_meal_by_id(self, meal_id: str) -> dict | None:
        """Return a single meal template by ID, or None."""
        for m in self.get_all_meals():
            if m["id"] == meal_id:
                return m
        return None

    def filter_meals(
        self,
        meal_type: str | None = None,
        dietary_tag: str | None = None,
    ) -> list[dict]:
        """Return meals matching all provided filters."""
        results = self.get_all_meals()

        if meal_type is not None:
            results = [m for m in results if m.get("meal_type") == meal_type]

        if dietary_tag is not None:
            results = [
                m for m in results
                if dietary_tag in m.get("dietary_tags", [])
            ]

        return results

    # ------------------------------------------------------------------
    # Guidelines
    # ------------------------------------------------------------------

    def get_all_guidelines(self) -> list[dict]:
        """Return all guideline topics as validated dicts."""
        raw = self._load_json("guidelines.json")
        items = raw.get("topics", [])
        return [_GuidelineTopic.model_validate(t).model_dump() for t in items]

    def get_guidelines_by_category(self, category: str) -> list[dict]:
        """Return guidelines filtered by category."""
        return [
            t for t in self.get_all_guidelines()
            if t.get("category") == category
        ]

    # ------------------------------------------------------------------
    # Raw access
    # ------------------------------------------------------------------

    def get_raw(self, filename: str) -> dict:
        """Return the raw (unvalidated) JSON dict for a top-level file."""
        return self._load_json(filename)


# ---------------------------------------------------------------------------
# Module-level singleton (lazy initialised)
# ---------------------------------------------------------------------------

_loader: KnowledgeLoader | None = None


def get_knowledge() -> KnowledgeLoader:
    """Return the module-level knowledge loader singleton."""
    global _loader
    if _loader is None:
        _loader = KnowledgeLoader()
    return _loader

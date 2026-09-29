"""Exercise library API router."""
from fastapi import APIRouter, HTTPException, Query, status

from app.models.common import Difficulty, MuscleGroup
from app.models.exercise import Exercise, ExerciseListResponse
from app.utils.knowledge import get_knowledge

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.get("", response_model=ExerciseListResponse)
def list_exercises(
    muscle_group: MuscleGroup | None = Query(default=None, description="Target muscle group"),
    equipment: str | None = Query(default=None, description="Required equipment"),
    difficulty: Difficulty | None = Query(default=None, description="Experience level"),
) -> ExerciseListResponse:
    """List exercises from the knowledge base with optional filtering."""
    knowledge = get_knowledge()
    raw_exercises = knowledge.filter_exercises(
        muscle_group=muscle_group.value if muscle_group else None,
        equipment=equipment,
        difficulty=difficulty.value if difficulty else None,
    )

    exercises = [Exercise.model_validate(ex) for ex in raw_exercises]

    filters_applied: dict[str, str] = {}
    if muscle_group:
        filters_applied["muscle_group"] = muscle_group.value
    if equipment:
        filters_applied["equipment"] = equipment
    if difficulty:
        filters_applied["difficulty"] = difficulty.value

    return ExerciseListResponse(
        exercises=exercises,
        total=len(exercises),
        filters_applied=filters_applied,
    )


@router.get("/{exercise_id}", response_model=Exercise)
def get_exercise_details(exercise_id: str) -> Exercise:
    """Retrieve details of a specific exercise by ID."""
    knowledge = get_knowledge()
    item = knowledge.get_exercise_by_id(exercise_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise '{exercise_id}' not found.",
        )
    return Exercise.model_validate(item)

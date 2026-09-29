"""Public model re-exports.

Import models from here rather than from sub-modules for a stable API surface.
"""
from .common import FitnessLevel, FitnessGoal, MuscleGroup, Difficulty, ErrorDetail
from .user import UserFitnessContext
from .exercise import Exercise, ExerciseListResponse
from .workout import (
    WorkoutExerciseStep,
    WorkoutPlan,
    WorkoutSuggestRequest,
    WorkoutSuggestResponse,
)
from .nutrition import (
    Macros,
    Food,
    FoodListResponse,
    Meal,
    MealPlan,
    MealPlanRequest,
    MealPlanResponse,
)
from .conversation import ConversationMessage, ConversationHistory
from .chat import ChatRequest, ChatResponse
from .responses import APIError, HealthResponse
from .feedback import (
    TempoMetrics,
    SessionMetrics,
    PreviousSessionSummary,
    WorkoutFeedbackRequest,
    WorkoutFeedbackResponse,
)

__all__ = [
    # common
    "FitnessLevel",
    "FitnessGoal",
    "MuscleGroup",
    "Difficulty",
    "ErrorDetail",
    # user
    "UserFitnessContext",
    # exercise
    "Exercise",
    "ExerciseListResponse",
    # workout
    "WorkoutExerciseStep",
    "WorkoutPlan",
    "WorkoutSuggestRequest",
    "WorkoutSuggestResponse",
    # nutrition
    "Macros",
    "Food",
    "FoodListResponse",
    "Meal",
    "MealPlan",
    "MealPlanRequest",
    "MealPlanResponse",
    # conversation
    "ConversationMessage",
    "ConversationHistory",
    # chat
    "ChatRequest",
    "ChatResponse",
    # responses
    "APIError",
    "HealthResponse",
    # feedback
    "TempoMetrics",
    "SessionMetrics",
    "PreviousSessionSummary",
    "WorkoutFeedbackRequest",
    "WorkoutFeedbackResponse",
]

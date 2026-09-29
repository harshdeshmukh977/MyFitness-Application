"""API v1 router bundle."""
from fastapi import APIRouter

from app.api.v1.chat import router as chat_router
from app.api.v1.exercises import router as exercises_router
from app.api.v1.feedback import router as feedback_router
from app.api.v1.health import router as health_router
from app.api.v1.nutrition import router as nutrition_router
from app.api.v1.workouts import router as workouts_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(exercises_router)
api_v1_router.include_router(workouts_router)
api_v1_router.include_router(nutrition_router)
api_v1_router.include_router(feedback_router)

__all__ = ["api_v1_router"]

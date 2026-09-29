"""Health check router."""
from fastapi import APIRouter

from app.config import get_settings
from app.models.responses import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return health status and running configuration."""
    cfg = get_settings()
    return HealthResponse(
        status="healthy",
        app_name=cfg.app_name,
        version=cfg.app_version,
        model=cfg.gemini_model,
    )

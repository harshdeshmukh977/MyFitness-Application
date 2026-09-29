"""MyFitness AI FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_v1_router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Lightweight, modular AI fitness assistance service for MyFitness.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for local frontend development and cross-origin integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount versioned API routes
app.include_router(api_v1_router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["Root"])
def root() -> dict:
    """Root endpoint providing service metadata."""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs_url": "/docs",
        "api_v1": f"{settings.api_v1_prefix}/health",
    }

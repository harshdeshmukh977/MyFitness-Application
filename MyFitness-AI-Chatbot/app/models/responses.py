"""Top-level API response envelope and standardized error model."""
from pydantic import BaseModel

from .common import ErrorDetail


class APIError(BaseModel):
    """Standard error envelope returned by the API."""

    error: ErrorDetail


class HealthResponse(BaseModel):
    """Response body for GET /api/v1/health."""

    status: str
    app_name: str
    version: str
    model: str

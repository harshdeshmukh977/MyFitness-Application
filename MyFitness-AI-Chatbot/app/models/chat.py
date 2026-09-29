"""Chat request and response models."""
from pydantic import BaseModel, Field

from .user import UserFitnessContext


class ChatRequest(BaseModel):
    """Request body for POST /api/v1/chat.

    Attributes
    ----------
    session_id:
        Opaque session identifier. ``None`` starts a new session.
    message:
        The user's natural-language message. Capped at 2 000 characters.
    user_context:
        Optional snapshot of the user's fitness profile.
        If omitted the system uses the session's stored context.
    """

    session_id: str | None = Field(default=None, description="Opaque session ID. None starts a new session.")
    message: str = Field(min_length=1, max_length=2000)
    user_context: UserFitnessContext | None = None


class ChatResponse(BaseModel):
    """Response body for POST /api/v1/chat."""

    session_id: str
    message: str = Field(description="AI assistant's text reply")
    intent: str = Field(description="Detected intent label for this turn")
    sources: list[str] = Field(
        default_factory=list,
        description="Knowledge file names that informed the answer",
    )
    suggestions: list[dict] = Field(
        default_factory=list,
        description="Follow-up action chips, e.g. [{\"type\": \"workout\", \"id\": \"push_1\"}]",
    )
    history_used: int = Field(
        default=0,
        ge=0,
        description="Number of prior messages in the session used as context for this response",
    )

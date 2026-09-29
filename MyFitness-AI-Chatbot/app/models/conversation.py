"""Conversation history and message models."""
from datetime import datetime
from pydantic import BaseModel, Field


class ConversationMessage(BaseModel):
    """A single turn in a chat session."""

    role: str = Field(description='"user" | "assistant" | "system"')
    content: str
    timestamp: datetime
    intent: str | None = Field(default=None, description="Intent label for this turn (filled for assistant turns)")
    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Extensible metadata (e.g. sources used, confidence flags in future).",
    )


class ConversationHistory(BaseModel):
    """Full history for a chat session."""

    session_id: str
    messages: list[ConversationMessage]
    summary: str | None = Field(
        default=None,
        description="Optional rolling or user-provided summary of the conversation so far.",
    )

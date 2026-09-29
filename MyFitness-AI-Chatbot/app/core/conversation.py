"""In-memory conversation session store.

Each session is a bounded list of messages capped at the configured
``MAX_SESSION_MESSAGES`` to keep memory usage predictable. Sessions
are identified by opaque string IDs.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from app.config import get_settings


# ---------------------------------------------------------------------------
# Message dataclass
# ---------------------------------------------------------------------------

@dataclass
class Message:
    """A single message in a conversation."""

    role: str  # "user" | "assistant" | "system"
    content: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    intent: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "intent": self.intent,
            "metadata": self.metadata,
        }


# ---------------------------------------------------------------------------
# Session
# ---------------------------------------------------------------------------

@dataclass
class Session:
    """A single conversation session."""

    session_id: str
    messages: list[Message] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    user_context: dict | None = None

    def add(self, message: Message) -> None:
        """Append a message and trim to the configured cap."""
        self.messages.append(message)
        cap = get_settings().max_session_messages
        if cap > 0 and len(self.messages) > cap:
            # Drop the oldest message(s); keep the most recent `cap`.
            self.messages = self.messages[-cap:]

    def history(self) -> list[Message]:
        """Return the current message history (most recent last)."""
        return list(self.messages)

    def clear(self) -> None:
        self.messages = []

    def set_user_context(self, context: dict) -> None:
        self.user_context = context


# ---------------------------------------------------------------------------
# Store
# ---------------------------------------------------------------------------

class ConversationStore:
    """In-memory store of conversation sessions.

    Thread-unsafe; intended for a single FastAPI process. For multi-worker
    deployments a shared backend would be needed (out of scope for MVP).
    """

    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}

    def create_session(self) -> Session:
        """Create a new session and return it."""
        sid = uuid.uuid4().hex
        session = Session(session_id=sid)
        self._sessions[sid] = session
        return session

    def get_session(self, session_id: str) -> Session | None:
        """Return an existing session, or None if not found."""
        return self._sessions.get(session_id)

    def get_or_create_session(self, session_id: str | None) -> Session:
        """Return an existing session by ID, or create a new one."""
        if session_id is None:
            return self.create_session()
        session = self.get_session(session_id)
        if session is None:
            session = self.create_session()
        return session

    def delete_session(self, session_id: str) -> bool:
        """Delete a session. Returns True if it existed."""
        return self._sessions.pop(session_id, None) is not None

    def clear_all(self) -> None:
        """Drop all sessions (test helper)."""
        self._sessions.clear()

    def session_count(self) -> int:
        """Return number of active sessions (test helper)."""
        return len(self._sessions)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_store: ConversationStore | None = None


def get_conversation_store() -> ConversationStore:
    """Return the process-wide conversation store."""
    global _store
    if _store is None:
        _store = ConversationStore()
    return _store

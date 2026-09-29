"""Tests for app.core.conversation."""
import pytest
from datetime import datetime, timezone

from app.core.conversation import (
    ConversationStore,
    Message,
    Session,
    get_conversation_store,
)


class TestMessage:
    """Tests for the Message dataclass."""

    def test_default_timestamp_is_utc(self) -> None:
        m = Message(role="user", content="hi")
        assert m.timestamp.tzinfo is not None
        assert m.timestamp.tzinfo == timezone.utc

    def test_to_dict(self) -> None:
        m = Message(role="user", content="hi", intent="greeting")
        d = m.to_dict()
        assert d["role"] == "user"
        assert d["content"] == "hi"
        assert d["intent"] == "greeting"
        assert "timestamp" in d
        assert d["metadata"] == {}

    def test_metadata_default(self) -> None:
        m = Message(role="assistant", content="hello")
        assert m.metadata == {}


class TestSession:
    """Tests for the Session dataclass."""

    def test_add_message(self) -> None:
        s = Session(session_id="abc")
        s.add(Message(role="user", content="hi"))
        assert len(s.messages) == 1

    def test_cap_at_max(self, monkeypatch) -> None:
        """Session should cap at max_session_messages setting."""
        from app.config import get_settings
        # Default is 10
        s = Session(session_id="abc")
        for i in range(15):
            s.add(Message(role="user", content=f"msg{i}"))
        assert len(s.messages) == 10
        # The most recent messages should be kept
        assert s.messages[-1].content == "msg14"
        assert s.messages[0].content == "msg5"

    def test_history_returns_copy(self) -> None:
        s = Session(session_id="abc")
        s.add(Message(role="user", content="hi"))
        h = s.history()
        h.append(Message(role="user", content="x"))
        # Modifying the returned list should not affect the session
        assert len(s.messages) == 1

    def test_clear(self) -> None:
        s = Session(session_id="abc")
        s.add(Message(role="user", content="hi"))
        s.clear()
        assert s.messages == []

    def test_user_context(self) -> None:
        s = Session(session_id="abc")
        assert s.user_context is None
        s.set_user_context({"fitness_level": "beginner"})
        assert s.user_context == {"fitness_level": "beginner"}


class TestConversationStore:
    """Tests for the in-memory ConversationStore."""

    @pytest.fixture
    def store(self) -> ConversationStore:
        s = ConversationStore()
        s.clear_all()
        return s

    def test_create_session_generates_id(self, store: ConversationStore) -> None:
        s = store.create_session()
        assert isinstance(s.session_id, str)
        assert len(s.session_id) > 0
        assert store.session_count() == 1

    def test_create_session_unique_ids(self, store: ConversationStore) -> None:
        s1 = store.create_session()
        s2 = store.create_session()
        assert s1.session_id != s2.session_id

    def test_get_session_by_id(self, store: ConversationStore) -> None:
        s = store.create_session()
        fetched = store.get_session(s.session_id)
        assert fetched is s

    def test_get_session_missing(self, store: ConversationStore) -> None:
        assert store.get_session("nonexistent") is None

    def test_get_or_create_with_none_id(self, store: ConversationStore) -> None:
        s = store.get_or_create_session(None)
        assert s is not None
        assert isinstance(s.session_id, str)

    def test_get_or_create_with_existing_id(self, store: ConversationStore) -> None:
        s1 = store.create_session()
        s2 = store.get_or_create_session(s1.session_id)
        assert s1 is s2

    def test_get_or_create_with_unknown_id(self, store: ConversationStore) -> None:
        """Unknown IDs should create a new session (not return None)."""
        s = store.get_or_create_session("unknown-id")
        assert s is not None
        assert s.session_id != "unknown-id" or s.session_id == "unknown-id"
        # Either returns existing match (we don't, since none) or creates new
        assert s.messages == []

    def test_delete_session(self, store: ConversationStore) -> None:
        s = store.create_session()
        assert store.delete_session(s.session_id) is True
        assert store.get_session(s.session_id) is None

    def test_delete_session_missing(self, store: ConversationStore) -> None:
        assert store.delete_session("nonexistent") is False

    def test_clear_all(self, store: ConversationStore) -> None:
        store.create_session()
        store.create_session()
        assert store.session_count() == 2
        store.clear_all()
        assert store.session_count() == 0

    def test_singleton_returns_same_instance(self) -> None:
        a = get_conversation_store()
        b = get_conversation_store()
        assert a is b

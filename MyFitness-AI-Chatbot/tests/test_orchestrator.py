"""Tests for app.core.orchestrator."""
import pytest
from unittest.mock import MagicMock

from app.core.conversation import ConversationStore
from app.core.llm import GeminiClient
from app.core.orchestrator import ChatOrchestrator, OrchestratorResult
from app.utils.knowledge import get_knowledge


class TestChatOrchestrator:
    """Tests for the chat orchestrator using a mocked LLM."""

    @pytest.fixture
    def mock_llm(self) -> MagicMock:
        m = MagicMock(spec=GeminiClient)
        m.generate.return_value = "Here is your workout plan..."
        return m

    @pytest.fixture
    def store(self) -> ConversationStore:
        s = ConversationStore()
        s.clear_all()
        return s

    @pytest.fixture
    def orch(self, mock_llm, store) -> ChatOrchestrator:
        return ChatOrchestrator(llm=mock_llm, knowledge=get_knowledge(), store=store)

    def test_chat_creates_session_when_none(self, orch: ChatOrchestrator) -> None:
        result = orch.chat("Hello!")
        assert result.session_id is not None
        assert len(result.session_id) > 0

    def test_chat_uses_provided_session(self, orch: ChatOrchestrator) -> None:
        first = orch.chat("Hello")
        second = orch.chat("Tell me more", session_id=first.session_id)
        assert first.session_id == second.session_id

    def test_chat_returns_llm_response(self, orch: ChatOrchestrator, mock_llm: MagicMock) -> None:
        mock_llm.generate.return_value = "A specific answer"
        result = orch.chat("What is protein?")
        assert result.message == "A specific answer"
        mock_llm.generate.assert_called_once()

    def test_chat_detects_workout_intent(self, orch: ChatOrchestrator) -> None:
        result = orch.chat("Create me a leg day workout")
        assert result.intent == "workout"

    def test_chat_detects_nutrition_intent(self, orch: ChatOrchestrator) -> None:
        result = orch.chat("How much protein should I eat?")
        assert result.intent == "nutrition"

    def test_chat_detects_exercise_intent(self, orch: ChatOrchestrator) -> None:
        result = orch.chat("How do I do a proper squat?")
        assert result.intent == "exercise"

    def test_chat_records_history(self, orch: ChatOrchestrator, store: ConversationStore) -> None:
        result = orch.chat("Hello there")
        # The session should have 2 messages: user + assistant
        session = store.get_session(result.session_id)
        assert session is not None
        assert len(session.messages) == 2
        assert session.messages[0].role == "user"
        assert session.messages[0].content == "Hello there"
        assert session.messages[1].role == "assistant"
        assert session.messages[1].content == "Here is your workout plan..."

    def test_chat_history_used_count(self, orch: ChatOrchestrator) -> None:
        r1 = orch.chat("First message")
        r2 = orch.chat("Second message", session_id=r1.session_id)
        # r2's prompt should have used 2 prior messages
        assert r2.history_used == 2

    def test_chat_persists_user_context(self, orch: ChatOrchestrator, store: ConversationStore) -> None:
        ctx = {"fitness_level": "beginner", "goals": ["build_muscle"]}
        r = orch.chat("Make me a workout", user_context=ctx)
        session = store.get_session(r.session_id)
        assert session is not None
        assert session.user_context == ctx

    def test_chat_handles_llm_error(self, orch: ChatOrchestrator, mock_llm: MagicMock) -> None:
        from app.core.llm import LLMError
        mock_llm.generate.side_effect = LLMError("API down")
        result = orch.chat("Hello")
        assert result.error is not None
        assert "API down" in result.error
        assert result.message == ""

    def test_chat_orchestrator_result_fields(self, orch: ChatOrchestrator) -> None:
        result = orch.chat("How much protein in chicken?")
        assert isinstance(result, OrchestratorResult)
        assert isinstance(result.session_id, str)
        assert isinstance(result.message, str)
        assert isinstance(result.intent, str)
        assert isinstance(result.confidence, float)
        assert isinstance(result.sources, list)
        assert isinstance(result.suggestions, list)
        assert isinstance(result.history_used, int)
        assert result.error is None

    def test_chat_suggestions_for_workout(self, orch: ChatOrchestrator) -> None:
        result = orch.chat("Give me a workout")
        # At least one suggestion should be present
        assert any(s.get("value") == "increase_difficulty" for s in result.suggestions)

    def test_chat_suggestions_for_nutrition(self, orch: ChatOrchestrator) -> None:
        result = orch.chat("How much protein should I eat?")
        assert any(s.get("value") == "elaborate" for s in result.suggestions)

    def test_chat_knowledge_injected_for_nutrition(self, orch: ChatOrchestrator, mock_llm: MagicMock) -> None:
        orch.chat("Tell me about protein")
        call_args = mock_llm.generate.call_args
        prompt = call_args.args[0]
        # Prompt should reference nutrition knowledge when intent is nutrition
        assert "protein" in prompt.lower() or "nutrition" in prompt.lower()

    def test_chat_uses_system_prompt(self, orch: ChatOrchestrator, mock_llm: MagicMock) -> None:
        orch.chat("Hello")
        call_args = mock_llm.generate.call_args
        prompt = call_args.args[0]
        assert "MyFitness AI" in prompt or "fitness" in prompt.lower()

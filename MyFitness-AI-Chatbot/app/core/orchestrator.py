"""Chat orchestrator — ties intent, knowledge, prompts, and the LLM together.

Given a user message and optional context, this module:
  1. Detects intent (keyword-based)
  2. Selects relevant knowledge from the loader
  3. Builds an appropriate prompt
  4. Calls Gemini and returns the response

The orchestrator owns the conversation store and is the single entry
point for chat request handling.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from app.core.llm import GeminiClient, LLMError
from app.core.intent import classify_intent, IntentResult
from app.core.prompts import (
    ChatPrompt,
    ExercisePrompt,
    NutritionPrompt,
    WorkoutPrompt,
    format_history,
)
from app.core.conversation import ConversationStore, Message, get_conversation_store
from app.utils.knowledge import KnowledgeLoader, get_knowledge


# ---------------------------------------------------------------------------
# Result type
# ---------------------------------------------------------------------------

@dataclass
class OrchestratorResult:
    """The orchestrator's response to a single user message."""

    session_id: str
    message: str
    intent: str
    confidence: float
    sources: list[str] = field(default_factory=list)
    suggestions: list[dict] = field(default_factory=list)
    history_used: int = 0
    error: str | None = None


# ---------------------------------------------------------------------------
# Knowledge selection helpers
# ---------------------------------------------------------------------------

def _select_knowledge_for_workout(query: str, loader: KnowledgeLoader) -> tuple[str, list[str]]:
    """Return (knowledge_text, sources) for a workout-related query."""
    # Pull a small slice of workouts as inspiration context
    workouts = loader.get_all_workouts()
    lines = ["Available workout templates (for inspiration):"]
    sources: list[str] = []
    for w in workouts[:5]:
        sources.append("workouts.json")
        lines.append(
            f"- {w['name']} ({w.get('fitness_level', '')}, {w.get('focus_area', '')}): "
            f"{w.get('description', '')}"
        )
    return "\n".join(lines), sorted(set(sources))


def _select_knowledge_for_exercise(query: str, loader: KnowledgeLoader) -> tuple[str, list[str]]:
    """Return (knowledge_text, sources) for an exercise query."""
    # Look for keyword matches across exercise names
    text = query.lower()
    matches = loader.filter_exercises()
    for ex in matches:
        if any(token in ex.get("name", "").lower() for token in text.split() if len(token) > 3):
            break
    # Just include the first few exercises as a sample
    sample = matches[:3]
    if not sample:
        return "", []
    lines = ["Some exercises from our library:"]
    sources = ["exercises.json"]
    for ex in sample:
        lines.append(
            f"- {ex['name']} ({', '.join(ex.get('muscle_groups', []))}): "
            f"{ex.get('instructions', [''])[0]}"
        )
    return "\n".join(lines), sources


def _select_knowledge_for_nutrition(query: str, loader: KnowledgeLoader) -> tuple[str, list[str]]:
    """Return (knowledge_text, sources) for a nutrition query."""
    text = query.lower()
    foods = loader.get_all_foods()
    matched: list[dict] = []
    for f in foods:
        if text in f.get("name", "").lower() or text in f.get("category", "").lower():
            matched.append(f)
        if len(matched) >= 5:
            break

    sources: list[str] = []
    lines: list[str] = []
    if matched:
        sources.append("nutrition/foods.json")
        lines.append("Foods related to your question:")
        for f in matched:
            m = f["macros"]
            lines.append(
                f"- {f['name']} ({f['serving_size']}): "
                f"{f['calories']} cal, "
                f"P {m['protein_grams']}g / C {m['carbs_grams']}g / F {m['fat_grams']}g"
            )

    guidelines = loader.get_guidelines_by_category("nutrition")
    if guidelines:
        sources.append("guidelines.json")
        lines.append("\nRelevant nutrition guidance:")
        for g in guidelines[:2]:
            lines.append(f"- {g['title']}: {g['content'][:200]}...")

    return "\n".join(lines), sorted(set(sources))


def _select_knowledge_for_general(query: str, loader: KnowledgeLoader) -> tuple[str, list[str]]:
    """Return (knowledge_text, sources) for a general question."""
    # Pull a few guidelines
    guidelines = loader.get_all_guidelines()
    if not guidelines:
        return "", []
    sources = ["guidelines.json"]
    lines = ["Relevant fitness guidance:"]
    for g in guidelines[:3]:
        lines.append(f"- {g['title']}: {g['content'][:200]}...")
    return "\n".join(lines), sources


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

class ChatOrchestrator:
    """Coordinates intent, knowledge, prompts, and the LLM for a single chat turn."""

    def __init__(
        self,
        llm: GeminiClient | None = None,
        knowledge: KnowledgeLoader | None = None,
        store: ConversationStore | None = None,
    ) -> None:
        self.llm = llm or GeminiClient()
        self.knowledge = knowledge or get_knowledge()
        self.store = store or get_conversation_store()

    def chat(
        self,
        message: str,
        session_id: str | None = None,
        user_context: dict | None = None,
    ) -> OrchestratorResult:
        """Handle one user message and return the AI response.

        Parameters
        ----------
        message:
            The user's message.
        session_id:
            Existing session ID, or None to start a new one.
        user_context:
            Optional user fitness context.

        Returns
        -------
        OrchestratorResult
            The AI's response and metadata.
        """
        # 1. Resolve session
        session = self.store.get_or_create_session(session_id)
        if user_context is not None:
            session.set_user_context(user_context)

        # 2. Detect intent
        intent_result: IntentResult = classify_intent(message)
        intent = intent_result.intent

        # 3. Select knowledge based on intent
        knowledge_text, sources = self._select_knowledge(intent, message)

        # 4. Build prompt
        prompt_text = self._build_prompt(
            intent=intent,
            message=message,
            session=session,
            knowledge_text=knowledge_text,
            user_context=user_context,
        )

        # 5. Call the LLM
        history_used = len(session.messages)
        try:
            answer = self.llm.generate(prompt_text)
        except LLMError as exc:
            # Fallback to knowledge-base response when Gemini is unavailable
            answer = self._fallback_message(intent)

        # 6. Update session history
        session.add(Message(role="user", content=message, intent=intent))
        session.add(
            Message(
                role="assistant",
                content=answer,
                intent=intent,
                metadata={"sources": sources},
            )
        )

        # 7. Build suggestions
        suggestions = self._build_suggestions(intent)

        return OrchestratorResult(
            session_id=session.session_id,
            message=answer,
            intent=intent,
            confidence=intent_result.confidence,
            sources=sources,
            suggestions=suggestions,
            history_used=history_used,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _select_knowledge(self, intent: str, message: str) -> tuple[str, list[str]]:
        if intent == "workout":
            return _select_knowledge_for_workout(message, self.knowledge)
        if intent == "exercise":
            return _select_knowledge_for_exercise(message, self.knowledge)
        if intent == "nutrition":
            return _select_knowledge_for_nutrition(message, self.knowledge)
        if intent == "goal":
            return _select_knowledge_for_general(message, self.knowledge)
        return _select_knowledge_for_general(message, self.knowledge)

    def _build_prompt(
        self,
        intent: str,
        message: str,
        session,
        knowledge_text: str,
        user_context: dict | None,
    ) -> str:
        """Build the appropriate prompt for the detected intent."""
        history = format_history(
            [m.to_dict() for m in session.history() if m.role in ("user", "assistant")]
        )
        ctx_str = _format_user_context(user_context or session.user_context)

        if intent == "workout":
            wp = WorkoutPrompt(
                user_message=message,
                knowledge_context=knowledge_text,
                user_context=ctx_str,
            )
            return wp.build()
        if intent == "exercise":
            ep = ExercisePrompt(user_message=message, knowledge_context=knowledge_text)
            return ep.build()
        if intent == "nutrition":
            np = NutritionPrompt(user_message=message, knowledge_context=knowledge_text)
            return np.build()

        # Default: plain chat with full system prompt + history
        cp = ChatPrompt(
            system=ChatPrompt.__dataclass_fields__["system"].default
            if False
            else _DEFAULT_SYSTEM,
            user_message=message,
            conversation_history=history,
        )
        return cp.build()

    def _build_suggestions(self, intent: str) -> list[dict]:
        """Return follow-up action chips for the user."""
        if intent == "workout":
            return [
                {"type": "action", "label": "Make it harder", "value": "increase_difficulty"},
                {"type": "action", "label": "Make it easier", "value": "decrease_difficulty"},
            ]
        if intent == "nutrition":
            return [
                {"type": "action", "label": "Tell me more", "value": "elaborate"},
                {"type": "action", "label": "Give me a meal plan", "value": "meal_plan"},
            ]
        if intent == "exercise":
            return [
                {"type": "action", "label": "Show alternatives", "value": "alternatives"},
            ]
        return []


    def _fallback_message(self, intent: str) -> str:
        """Return a helpful fallback message when the LLM is unavailable."""
        if intent == "workout":
            return (
                "I'm here to help with your fitness questions! "
                "For workout-specific advice, I recommend focusing on proper form, "
                "consistent progression, and listening to your body. "
                "Consider tracking your sets, reps, and how you feel during each session. "
                "Remember to warm up properly and stay hydrated."
            )
        elif intent == "exercise":
            return (
                "For exercise guidance, prioritize proper technique over speed or weight. "
                "Start with lighter weights to master the movement pattern, "
                "then gradually increase as your form improves. "
                "If you're unsure about an exercise, consider consulting with a fitness professional "
                "or using trusted resources for form cues."
            )
        elif intent == "nutrition":
            return (
                "For nutrition, focus on whole foods, adequate protein, and staying hydrated. "
                "Aim for balanced meals with lean proteins, complex carbohydrates, and healthy fats. "
                "Listen to your body's hunger cues and consider meal timing around your workouts. "
                "Everyone's nutritional needs are different—find what works best for you and your goals."
            )
        else:  # goal or general
            return (
                "I'm your AI fitness assistant! While I'm experiencing a brief technical hiccup, "
                "here's some general advice: stay consistent with your fitness routine, "
                "prioritize sleep and recovery, and make small sustainable changes over time. "
                "Whether you're working toward strength, endurance, or wellness goals, "
                "consistency beats perfection. Feel free to ask again in a moment!"
            )


# ---------------------------------------------------------------------------
# Default system prompt for general chat
# ---------------------------------------------------------------------------

_DEFAULT_SYSTEM = (
    "You are MyFitness AI — a helpful, knowledgeable fitness and nutrition "
    "assistant. Provide concise, practical advice grounded in the user's "
    "context when provided. Always include a brief disclaimer that your "
    "guidance is general and not a substitute for professional medical advice."
)


def _format_user_context(ctx: dict | None) -> str:
    """Render a user context dict as a readable string for the prompt."""
    if not ctx:
        return ""
    parts: list[str] = []
    if ctx.get("fitness_level"):
        parts.append(f"Fitness level: {ctx['fitness_level']}")
    if ctx.get("goals"):
        goals = ctx["goals"]
        if isinstance(goals, list):
            parts.append(f"Goals: {', '.join(map(str, goals))}")
    if ctx.get("available_equipment"):
        parts.append(f"Equipment: {', '.join(ctx['available_equipment'])}")
    if ctx.get("dietary_restrictions"):
        parts.append(f"Dietary restrictions: {', '.join(ctx['dietary_restrictions'])}")
    if ctx.get("safety_limitations"):
        parts.append(f"Limitations: {', '.join(ctx['safety_limitations'])}")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Module-level convenience
# ---------------------------------------------------------------------------

_orchestrator: ChatOrchestrator | None = None


def get_orchestrator() -> ChatOrchestrator:
    """Return the process-wide chat orchestrator."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ChatOrchestrator()
    return _orchestrator

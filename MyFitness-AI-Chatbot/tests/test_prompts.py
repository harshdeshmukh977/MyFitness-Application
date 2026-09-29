"""Tests for app.core.prompts."""
import pytest

from app.core.prompts import (
    SYSTEM_PROMPT,
    WORKOUT_DISCLAIMER,
    DIETARY_DISCLAIMER,
    ChatPrompt,
    WorkoutPrompt,
    NutritionPrompt,
    ExercisePrompt,
    format_turn,
    format_history,
)


class TestSystemPrompt:
    def test_contains_persona(self) -> None:
        assert "MyFitness AI" in SYSTEM_PROMPT

    def test_contains_safety_guidelines(self) -> None:
        # Should reference medical disclaimer
        assert "medical" in SYSTEM_PROMPT.lower() or "healthcare" in SYSTEM_PROMPT.lower()


class TestDisclaimers:
    def test_workout_disclaimer_present(self) -> None:
        assert "consult" in WORKOUT_DISCLAIMER.lower() or "medical" in WORKOUT_DISCLAIMER.lower()

    def test_dietary_disclaimer_present(self) -> None:
        assert "registered dietitian" in DIETARY_DISCLAIMER.lower() or "healthcare" in DIETARY_DISCLAIMER.lower()


class TestChatPrompt:
    def test_build_without_history(self) -> None:
        p = ChatPrompt(system="SYS", user_message="hi", conversation_history=[])
        out = p.build()
        assert "SYS" in out
        assert "hi" in out
        assert "Previous conversation" not in out

    def test_build_with_history(self) -> None:
        p = ChatPrompt(
            system="SYS",
            user_message="latest",
            conversation_history=["User: first", "Assistant: response"],
        )
        out = p.build()
        assert "Previous conversation" in out
        assert "User: first" in out
        assert "Assistant: response" in out
        assert "latest" in out


class TestWorkoutPrompt:
    def test_build_includes_disclaimer(self) -> None:
        p = WorkoutPrompt(
            user_message="Make a leg workout",
            knowledge_context="context here",
            user_context="level: beginner",
        )
        out = p.build()
        assert "leg workout" in out
        assert "context here" in out
        assert "beginner" in out
        assert WORKOUT_DISCLAIMER in out


class TestNutritionPrompt:
    def test_build_includes_disclaimer(self) -> None:
        p = NutritionPrompt(
            user_message="How much protein?",
            knowledge_context="chicken has 31g protein",
        )
        out = p.build()
        assert "How much protein?" in out
        assert "chicken" in out
        assert DIETARY_DISCLAIMER in out


class TestExercisePrompt:
    def test_build_includes_disclaimer(self) -> None:
        p = ExercisePrompt(
            user_message="How do I squat?",
            knowledge_context="Keep chest tall",
        )
        out = p.build()
        assert "How do I squat?" in out
        assert "chest tall" in out
        assert WORKOUT_DISCLAIMER in out


class TestFormatHelpers:
    def test_format_turn_user(self) -> None:
        assert format_turn("user", "hi") == "User: hi"

    def test_format_turn_assistant(self) -> None:
        assert format_turn("assistant", "hello") == "Assistant: hello"

    def test_format_turn_other(self) -> None:
        assert format_turn("system", "x") == "system: x"

    def test_format_history(self) -> None:
        turns = [
            {"role": "user", "content": "hi"},
            {"role": "assistant", "content": "hello"},
        ]
        result = format_history(turns)
        assert result == ["User: hi", "Assistant: hello"]

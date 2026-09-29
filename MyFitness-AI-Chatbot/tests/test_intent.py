"""Tests for app.core.intent."""
import pytest
from app.core.intent import IntentClassifier, IntentResult, classify_intent


class TestIntentClassifier:
    """Tests for the keyword-based intent classifier."""

    @pytest.fixture
    def clf(self) -> IntentClassifier:
        return IntentClassifier()

    # ------------------------------------------------------------------
    # Workout intent
    # ------------------------------------------------------------------
    @pytest.mark.parametrize("msg", [
        "Create a workout for chest day",
        "Give me a 4-day split program",
        "Build me a push/pull/legs routine",
        "Design a beginner full-body workout",
        "Can you make me a gym program?",
        "I need a leg day workout",
        "Suggest a workout routine",
    ])
    def test_workout_intent(self, clf: IntentClassifier, msg: str) -> None:
        result = clf.classify(msg)
        assert result.intent == "workout"
        assert result.confidence > 0

    # ------------------------------------------------------------------
    # Exercise intent
    # ------------------------------------------------------------------
    @pytest.mark.parametrize("msg", [
        "How do I do a proper squat?",
        "What's the correct form for deadlifts?",
        "How to do push-ups without hurting my back",
        "Show me how to do a dumbbell row",
        "What are common mistakes with bench press?",
        "Is my form correct for a plank?",
        "What muscles does the lat pulldown target?",
    ])
    def test_exercise_intent(self, clf: IntentClassifier, msg: str) -> None:
        result = clf.classify(msg)
        assert result.intent == "exercise"
        assert result.confidence > 0

    # ------------------------------------------------------------------
    # Nutrition intent
    # ------------------------------------------------------------------
    @pytest.mark.parametrize("msg", [
        "How much protein should I eat?",
        "What are good carbs for energy?",
        "Can you suggest a meal plan?",
        "How many calories should I eat to lose weight?",
        "What's a high-protein breakfast?",
        "Is intermittent fasting good for cutting?",
        "How much fat should I eat daily?",
    ])
    def test_nutrition_intent(self, clf: IntentClassifier, msg: str) -> None:
        result = clf.classify(msg)
        assert result.intent == "nutrition"
        assert result.confidence > 0

    # ------------------------------------------------------------------
    # Goal intent
    # ------------------------------------------------------------------
    @pytest.mark.parametrize("msg", [
        "I want to lose 10 pounds",
        "How can I build muscle as a beginner?",
        "What's the best way to track my progress?",
        "I'm stuck at a plateau, help",
        "I need to cut fat for summer",
        "How often should I train to build muscle?",
    ])
    def test_goal_intent(self, clf: IntentClassifier, msg: str) -> None:
        result = clf.classify(msg)
        assert result.intent == "goal"
        assert result.confidence > 0

    # ------------------------------------------------------------------
    # Greeting intent
    # ------------------------------------------------------------------
    @pytest.mark.parametrize("msg", [
        "Hello!",
        "Hey there",
        "Good morning",
        "Hi",
    ])
    def test_greeting_intent(self, clf: IntentClassifier, msg: str) -> None:
        result = clf.classify(msg)
        assert result.intent == "greeting"
        assert result.confidence > 0

    # ------------------------------------------------------------------
    # Edge cases
    # ------------------------------------------------------------------
    def test_empty_message(self, clf: IntentClassifier) -> None:
        result = clf.classify("")
        assert result.intent == "unclear"
        assert result.confidence == 0.0

    def test_whitespace_only(self, clf: IntentClassifier) -> None:
        result = clf.classify("   \n\t  ")
        assert result.intent == "unclear"

    def test_module_convenience_function(self) -> None:
        result = classify_intent("Give me a workout")
        assert result.intent == "workout"

    def test_intent_result_helpers(self, clf: IntentClassifier) -> None:
        r = clf.classify("Hello!")
        assert r.is_greeting()
        assert not r.is_unclear()
        assert r.is_clear()

        r2 = clf.classify("gsdkfhsdf")
        assert r2.is_unclear()
        assert not r2.is_clear()

    def test_confidence_bounded(self, clf: IntentClassifier) -> None:
        """Confidence should always be in [0, 1]."""
        for msg in ["hello", "how much protein should i eat?", "create a workout", "xyz123"]:
            r = clf.classify(msg)
            assert 0.0 <= r.confidence <= 1.0, f"confidence {r.confidence} out of range for: {msg}"

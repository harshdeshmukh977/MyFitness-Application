"""Lightweight intent classifier for the fitness chatbot.

Uses simple keyword matching to classify a user message into one of the
supported intents. This is a fast, deterministic, zero-cost approach
suitable for an MVP. It does not call the LLM.

Supported intents:

- ``workout``          — requests for workout plans or suggestions
- ``exercise``         — requests for exercise info, form, or modifications
- ``nutrition``        — questions about food, meals, macros, or diet
- ``goal``             — goal-setting or progress-tracking statements
- ``greeting``         — casual greetings
- ``general``          — general fitness questions not fitting other categories
- ``unclear``          — cannot confidently classify
"""
from __future__ import annotations

import re
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Keyword sets
# ---------------------------------------------------------------------------

_KEYWORDS: dict[str, frozenset[str]] = {
    "workout": frozenset({
        "workout", "work out", "routine", "program", "plan", "session",
        "training", "train", "lifting", "lift", "gym", "exercise plan",
        "leg day", "chest day", "push day", "pull day", "upper body",
        "lower body", "full body", "build a workout", "create a workout",
        "give me a workout", "make me a workout", "generate a workout",
        "suggest a workout", "design a workout", "weekly plan",
        "3 day", "4 day", "5 day", "split", "deload",
    }),
    "exercise": frozenset({
        "exercise", "exercises", "how to", "form", "technique", "tip",
        "mistake", "mistakes", "proper", "correct", "do a", "doing a",
        "how do i", "how do you", "is this right", "am i doing",
        "instruction", "instructions", "demo", "demonstration",
        "tone", "target", "focus on", "for my", "alternative",
        "substitute", "modification", "modify", "advanced",
        "variation", "reps", "sets", "hold", "seconds",
        "bodyweight", "dumbbell", "barbell", "cable", "machine",
        "push up", "pushup", "squat", "lunge", "plank", "curl",
        "press", "raise", "row", "fly", "extension", "dip",
        "pulldown", "pull up", "pullup", "deadlift", "bench",
    }),
    "nutrition": frozenset({
        "nutrition", "diet", "eating", "food", "meal", "macro", "macros",
        "calorie", "calories", "protein", "carbs", "fat", "grams",
        "carbohydrate", "what should i eat", "what can i eat", "meal plan",
        "breakfast", "lunch", "dinner", "snack", "snacks", "supplement",
        "preworkout", "post workout", "postworkout", "intra workout",
        "nutritionist", "vegetarian", "vegan", "gluten free", "allergy",
        "intolerance", "cutting", "bulking", "recomposition",
        "nutritional", "nutrient", "fiber", "hydrate", "hydration",
        "water intake", "sodium", "electrolyte", "creatine", "whey",
    }),
    "goal": frozenset({
        "goal", "goals", "target", "aim", "progress", "track", "tracking",
        "measure", "measurement", "milestone", "lose", "lose weight",
        "lose fat", "gain muscle", "build muscle", "build", "bulk",
        "recomp", "cut", "pounds", "summer",
        "improve", "increase", "decrease", "reduce", "maintain",
        "starting", "beginner", "first day", "week one", "where do i start",
        "how much", "how many", "how often", "how long", "consistency",
        "stuck", "plateau", "adapting", "no progress",
    }),
    "greeting": frozenset({
        "hello", "hi", "hey", "morning", "afternoon", "evening",
        "good morning", "good afternoon", "good evening", "greetings",
        "sup", "yo", "hiya", "howdy",
    }),
}

# Patterns that signal a clear intent regardless of keyword overlap
_EXACT_PATTERNS: dict[str, re.Pattern] = {
    "workout": re.compile(
        r"\b(workout|program|routine)\b.*\b(build|create|design|suggest|generate|give me)\b"
        r"|\b(build|create|design|suggest|generate|give me)\b.*\b(workout|program|routine)\b",
        re.IGNORECASE,
    ),
    "nutrition": re.compile(
        r"\b(meal plan|nutrition|diet|macros|calories|protein|carbs|fat)\b.*\b(plan|guide|suggest|generate)\b"
        r"|\b(plan|guide|suggest|generate)\b.*\b(meal|nutrition|diet|macros|calories)\b",
        re.IGNORECASE,
    ),
    "exercise": re.compile(
        r"\b(exercise|how to|how do i|form|technique|instruction)\b",
        re.IGNORECASE,
    ),
    "goal": re.compile(
        r"\b(goal|track|progress|plateau)\b",
        re.IGNORECASE,
    ),
}


# ---------------------------------------------------------------------------
# Result type
# ---------------------------------------------------------------------------

@dataclass
class IntentResult:
    """The result of intent classification."""

    intent: str
    confidence: float  # 0.0–1.0 (heuristic; not from model)

    def is_clear(self) -> bool:
        """Return True if confidence is high enough to act on without clarification."""
        return self.confidence >= 0.6

    def is_greeting(self) -> bool:
        return self.intent == "greeting"

    def is_unclear(self) -> bool:
        return self.intent == "unclear"


# ---------------------------------------------------------------------------
# Classifier
# ---------------------------------------------------------------------------

class IntentClassifier:
    """Keyword-based intent classifier.

    Classifies a user message into one of the supported intents using
    keyword matching and regex patterns. Fast and deterministic.
    """

    def classify(self, message: str) -> IntentResult:
        """Classify a user message.

        Parameters
        ----------
        message:
            The raw user message.

        Returns
        -------
        IntentResult
            Detected intent and a heuristic confidence score.
        """
        text = message.lower().strip()
        if not text:
            return IntentResult(intent="unclear", confidence=0.0)

        # First: check exact regex patterns (highest priority)
        for intent, pattern in _EXACT_PATTERNS.items():
            if pattern.search(text):
                return IntentResult(intent=intent, confidence=0.9)

        # Second: count keyword hits per intent
        scores: dict[str, float] = {}
        words = set(re.findall(r"\b\w+\b", text))

        for intent, keywords in _KEYWORDS.items():
            hits = words & keywords
            if hits:
                # Score = fraction of keyword hits relative to message length
                scores[intent] = len(hits) / max(len(words), 1)

        if not scores:
            return IntentResult(intent="unclear", confidence=0.0)

        # Pick the intent with the highest score.
        # Priority order for tie-breaking (lower value = higher priority):
        # nutrition > goal > exercise > workout > greeting > general
        _PRIORITY: dict[str, int] = {
            "nutrition": 0,
            "goal": 1,
            "exercise": 2,
            "workout": 3,
            "greeting": 4,
            "general": 5,
        }
        best_intent = min(
            scores.keys(),
            key=lambda k: (1.0 - scores[k], _PRIORITY.get(k, 99)),
        )
        best_score = scores[best_intent]

        # Convert raw score to a 0.0-1.0 confidence
        # (score is proportion of keywords hit; cap at 1.0)
        confidence = min(best_score * 3, 1.0)  # scale up small scores slightly

        # If best score is marginal, mark as unclear
        if confidence < 0.3:
            return IntentResult(intent="unclear", confidence=0.0)

        return IntentResult(intent=best_intent, confidence=round(confidence, 2))


# ---------------------------------------------------------------------------
# Module-level convenience
# ---------------------------------------------------------------------------

_classifier = IntentClassifier()


def classify_intent(message: str) -> IntentResult:
    """Classify a user message using the default classifier."""
    return _classifier.classify(message)

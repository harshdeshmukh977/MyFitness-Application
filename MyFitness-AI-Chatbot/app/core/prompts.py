"""System prompts and prompt builders for fitness chat.

All prompts are fitness-domain scoped. The system prompt establishes
the AI's persona and enforces safety guardrails.
"""
from __future__ import annotations

from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are MyFitness AI — a helpful, knowledgeable fitness and nutrition assistant. Your role is to provide general fitness guidance, workout suggestions, exercise information, and general nutrition advice.

IMPORTANT GUIDELINES:
- Only provide general fitness and nutrition information. You are not a medical professional.
- Always include a disclaimer that users should consult a qualified healthcare provider before starting a new fitness program, especially if they have pre-existing conditions or injuries.
- Do not provide specific medical diagnoses or treatment recommendations.
- If a user's question is outside general fitness and nutrition, politely redirect to relevant fitness topics.
- Be encouraging, clear, and practical in your responses.
- When providing workout or nutrition suggestions, acknowledge the user's stated preferences, goals, and any limitations they mention.
- Keep responses concise and focused on what the user asked. Do not overwhelm with excessive information unless specifically requested.
- Use simple, accessible language. Many users may be beginners.

CONVERSATION STYLE:
- Be conversational but professional.
- Ask clarifying questions when needed to give better personalized guidance.
- Provide actionable, specific advice rather than vague generalities.
- When suggesting exercises or workouts, mention equipment requirements and difficulty level.
"""

DIETARY_DISCLAIMER = (
    "\n\n*Disclaimer: Nutritional information provided is general and based on common reference data. "
    "For personalized dietary advice — especially for medical conditions, allergies, or specific health goals — "
    "consult a registered dietitian or qualified healthcare provider."
)

WORKOUT_DISCLAIMER = (
    "\n\n*Disclaimer: Exercise suggestions are general guidance. "
    "Stop immediately if you feel pain, dizziness, or discomfort. "
    "Consult a qualified healthcare professional before starting any new exercise program."
)


@dataclass
class ChatPrompt:
    """A constructed prompt ready to send to the model."""

    system: str
    user_message: str
    conversation_history: list[str]

    def build(self) -> str:
        """Assemble all parts into a single prompt string."""
        parts = [self.system]

        if self.conversation_history:
            parts.append("\n\nPrevious conversation:")
            for turn in self.conversation_history:
                parts.append(f"\n{turn}")

        parts.append("\n\nCurrent question:")
        parts.append(f"\n{self.user_message}")
        return "".join(parts)


@dataclass
class WorkoutPrompt:
    """A prompt for structured workout generation."""

    user_message: str
    knowledge_context: str
    user_context: str
    disclaimer: str = ""

    def build(self) -> str:
        parts = [
            SYSTEM_PROMPT,
            "\n\nKnowledge base context:",
            self.knowledge_context or "\n(No knowledge base context available.)",
            "\n\nUser profile context:",
            self.user_context or "\n(No user profile context provided.)",
            "\n\nGenerate a workout based on the user's request below.",
            self.user_message,
            WORKOUT_DISCLAIMER,
        ]
        return "".join(parts)


@dataclass
class NutritionPrompt:
    """A prompt for general nutrition Q&A."""

    user_message: str
    knowledge_context: str
    disclaimer: str = ""

    def build(self) -> str:
        parts = [
            SYSTEM_PROMPT,
            "\n\nRelevant nutrition knowledge:",
            self.knowledge_context or "\n(No specific nutrition knowledge available.)",
            "\n\nAnswer the user's nutrition question:",
            self.user_message,
            DIETARY_DISCLAIMER,
        ]
        return "".join(parts)


@dataclass
class ExercisePrompt:
    """A prompt for exercise information."""

    user_message: str
    knowledge_context: str

    def build(self) -> str:
        parts = [
            SYSTEM_PROMPT,
            "\n\nRelevant exercise knowledge:",
            self.knowledge_context or "\n(No exercise knowledge available.)",
            "\n\nAnswer the user's question about exercises:",
            self.user_message,
            WORKOUT_DISCLAIMER,
        ]
        return "".join(parts)


@dataclass
class WorkoutFeedbackPrompt:
    """A prompt for generating AI coaching feedback from session metrics, pose detection, and rep counts."""

    exercise_name: str
    target_reps: int
    completed_reps: int
    sets: int
    weight_kg: float | None
    form_accuracy: float | None
    detected_faults: list[str]
    user_context: str
    knowledge_context: str
    tempo_info: str = ""
    history_summary: str = ""

    def build(self) -> str:
        parts = [
            SYSTEM_PROMPT,
            "\n\nTask: You are an expert AI strength and conditioning coach analyzing a user's completed exercise set.",
            f"\nExercise: {self.exercise_name}",
            f"\nPerformance: Completed {self.completed_reps} of {self.target_reps} target reps across {self.sets} set(s).",
        ]
        if self.weight_kg is not None:
            parts.append(f"\nWeight: {self.weight_kg} kg")
        if self.form_accuracy is not None:
            parts.append(f"\nForm Accuracy Score: {self.form_accuracy:.1f}%")
        if self.detected_faults:
            parts.append(f"\nDetected Pose/Form Faults: {', '.join(self.detected_faults)}")
        if self.tempo_info:
            parts.append(f"\nTempo & Cadence: {self.tempo_info}")
        if self.history_summary:
            parts.append(f"\nPrevious History: {self.history_summary}")
        if self.user_context:
            parts.append(f"\nUser Profile: {self.user_context}")
        if self.knowledge_context:
            parts.append(f"\nExercise Technique Reference: {self.knowledge_context}")

        parts.append(
            "\n\nProvide structured, encouraging coaching feedback. "
            "Address: 1) Overall performance summary, 2) Rep completion analysis, "
            "3) Form & pose corrections addressing the detected faults, 4) Progression comparison against past history, "
            "and 5) 2-3 immediate actionable cues for their next set."
        )
        parts.append(WORKOUT_DISCLAIMER)
        return "".join(parts)


# ---------------------------------------------------------------------------
# Conversation history formatting
# ---------------------------------------------------------------------------

def format_turn(role: str, content: str) -> str:
    """Format a single conversation turn for injection into the prompt."""
    label = {"user": "User", "assistant": "Assistant", "system": "system"}.get(role, role)
    return f"{label}: {content}"


def format_history(turns: list[dict]) -> list[str]:
    """Convert a list of conversation message dicts to formatted strings."""
    return [format_turn(t["role"], t["content"]) for t in turns]

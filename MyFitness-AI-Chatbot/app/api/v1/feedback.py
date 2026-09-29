"""Feedback API router — AI-powered workout, rep-counter, and pose feedback."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.llm import GeminiClient, LLMError
from app.core.prompts import WorkoutFeedbackPrompt, WORKOUT_DISCLAIMER
from app.models.feedback import WorkoutFeedbackRequest, WorkoutFeedbackResponse
from app.utils.knowledge import get_knowledge

router = APIRouter(prefix="/feedback", tags=["Feedback"])


# ---------------------------------------------------------------------------
# Helper: build human-readable context strings from structured request fields
# ---------------------------------------------------------------------------

def _format_user_context(request: WorkoutFeedbackRequest) -> str:
    ctx = request.user_context
    if ctx is None:
        return ""
    parts = []
    if ctx.fitness_level:
        parts.append(f"Level: {ctx.fitness_level.value}")
    if ctx.goals:
        parts.append(f"Goals: {', '.join(g.value for g in ctx.goals)}")
    if ctx.safety_limitations:
        parts.append(f"Safety notes: {', '.join(ctx.safety_limitations)}")
    if ctx.available_equipment:
        parts.append(f"Equipment: {', '.join(ctx.available_equipment)}")
    return " | ".join(parts)


def _format_tempo(request: WorkoutFeedbackRequest) -> str:
    t = request.tempo
    if t is None:
        return ""
    parts = []
    if t.rep_duration_seconds is not None:
        parts.append(f"Total rep duration {t.rep_duration_seconds:.1f}s")
    if t.eccentric_seconds is not None:
        parts.append(f"Eccentric {t.eccentric_seconds:.1f}s")
    if t.concentric_seconds is not None:
        parts.append(f"Concentric {t.concentric_seconds:.1f}s")
    if t.pause_seconds is not None:
        parts.append(f"Pause {t.pause_seconds:.1f}s")
    return ", ".join(parts)


def _format_history(request: WorkoutFeedbackRequest) -> str:
    if not request.previous_history:
        return ""
    lines = []
    for i, h in enumerate(request.previous_history[:5], start=1):
        line = f"Session {i}"
        if h.date:
            line += f" ({h.date})"
        line += f": {h.sets} sets × {h.reps_completed} reps"
        if h.weight_kg is not None:
            line += f" @ {h.weight_kg:.1f} kg"
        if h.form_accuracy is not None:
            line += f", form {h.form_accuracy:.0f}%"
        lines.append(line)
    return "; ".join(lines)


def _format_knowledge_context(request: WorkoutFeedbackRequest) -> str:
    knowledge = get_knowledge()
    ex_info = knowledge.get_exercise_by_id(request.exercise_id)
    if ex_info is None:
        return ""
    parts = []
    if ex_info.get("instructions"):
        parts.append("Instructions: " + " ".join(ex_info["instructions"][:3]))
    if ex_info.get("common_mistakes"):
        parts.append("Common mistakes: " + "; ".join(ex_info["common_mistakes"][:3]))
    if ex_info.get("tips"):
        parts.append("Tips: " + "; ".join(ex_info["tips"][:3]))
    return " | ".join(parts)


def _resolve_exercise_name(request: WorkoutFeedbackRequest) -> str:
    if request.exercise_name:
        return request.exercise_name
    knowledge = get_knowledge()
    ex_info = knowledge.get_exercise_by_id(request.exercise_id)
    if ex_info:
        return ex_info["name"]
    return request.exercise_id.replace("_", " ").title()


# ---------------------------------------------------------------------------
# Fallback structured response (used when Gemini is unavailable)
# ---------------------------------------------------------------------------

def _build_fallback_response(request: WorkoutFeedbackRequest, exercise_name: str) -> WorkoutFeedbackResponse:
    """Return a deterministic, knowledge-base-grounded response without calling Gemini."""
    completed = request.completed_reps
    target = request.target_reps
    pct = (completed / target * 100) if target else 0
    form = request.form_accuracy

    # Overall feedback
    if pct >= 100:
        overall = f"Excellent work completing all {target} reps of {exercise_name}!"
    elif pct >= 80:
        overall = (
            f"Good effort on {exercise_name} — you hit {completed}/{target} reps "
            f"({pct:.0f}%). You're building solid consistency."
        )
    else:
        overall = (
            f"You completed {completed}/{target} reps ({pct:.0f}%) of {exercise_name}. "
            f"Keep going — the adaptation starts here."
        )

    # Rep/performance feedback
    gap = target - completed
    if gap <= 0:
        perf = "Rep target achieved. Consider progressing by adding a set or increasing reps next session."
    else:
        perf = (
            f"You fell {gap} rep(s) short of the {target}-rep target. "
            "Focus on controlled tempo and bracing your core to squeeze out the remaining reps next set."
        )

    # Form feedback
    if request.detected_faults:
        fault_descriptions = {
            "insufficient_depth": "your squat depth needs improvement — aim to break parallel",
            "excessive_forward_lean": "reduce forward torso lean by keeping your chest up and driving through your heels",
            "knees_caving_in": "push your knees outward to align with your toes throughout the movement",
            "uneven_extension": "focus on symmetrical lock-out at the top of each rep",
        }
        cues = [fault_descriptions.get(f, f.replace("_", " ")) for f in request.detected_faults]
        form_txt = f"Form faults detected: {', '.join(cues)}."
        if form is not None:
            form_txt = f"Form accuracy {form:.0f}%. " + form_txt
    elif form is not None:
        if form >= 90:
            form_txt = f"Outstanding form at {form:.0f}% accuracy — keep it up!"
        elif form >= 75:
            form_txt = f"Form at {form:.0f}% — solid execution with room for fine-tuning."
        else:
            form_txt = f"Form accuracy is {form:.0f}%. Prioritize quality over quantity; consider reducing weight or reps."
    else:
        form_txt = "Focus on maintaining proper alignment and controlled breathing throughout each rep."

    # History/progression feedback
    if request.previous_history:
        last = request.previous_history[-1]
        if last.reps_completed < completed:
            progression = f"You improved vs. your last logged session ({last.reps_completed} reps) — great progressive overload!"
        elif last.reps_completed == completed:
            progression = "Consistent output vs. last session. Next step: add 1 rep or a small amount of resistance."
        else:
            progression = (
                f"You hit {completed} reps today vs. {last.reps_completed} last session. "
                "If this was a fatigue day, that's fine — recovery is part of progress."
            )
    else:
        progression = "No previous history on file. This session will become your new baseline."

    # Actionable tips
    tips: list[str] = []
    if "insufficient_depth" in request.detected_faults:
        tips.append("Place heels on a small wedge or plates to assist depth while you build ankle flexibility.")
    if "excessive_forward_lean" in request.detected_faults:
        tips.append("Hold a light counterweight (e.g. a 2.5 kg plate) in front of you to practise staying upright.")
    if gap > 0:
        tips.append("Use a 3-second eccentric (lowering) phase to build strength in the sticking point.")
    if not tips:
        tips.append("Progress next session by adding 1 extra rep or reducing rest by 10 seconds.")

    knowledge = get_knowledge()
    sources = []
    if knowledge.get_exercise_by_id(request.exercise_id):
        sources.append("exercises.json")

    return WorkoutFeedbackResponse(
        overall_feedback=overall,
        performance_feedback=perf,
        form_feedback=form_txt,
        progression_feedback=progression,
        actionable_tips=tips,
        safety_disclaimer=WORKOUT_DISCLAIMER.strip(),
        sources=sources,
    )


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/workout",
    response_model=WorkoutFeedbackResponse,
    summary="AI-powered workout coaching feedback",
    description=(
        "Accepts structured workout, rep-counter, and pose-detection data and "
        "returns AI coaching feedback covering performance, form corrections, "
        "progression insights, and actionable cues. "
        "Falls back to knowledge-base-grounded logic when the Gemini API is unavailable."
    ),
)
def workout_feedback(request: WorkoutFeedbackRequest) -> WorkoutFeedbackResponse:
    """Generate AI-powered coaching feedback for a completed exercise set."""
    exercise_name = _resolve_exercise_name(request)
    knowledge_context = _format_knowledge_context(request)
    user_context_str = _format_user_context(request)
    tempo_info = _format_tempo(request)
    history_summary = _format_history(request)

    # Build prompt and call Gemini
    prompt = WorkoutFeedbackPrompt(
        exercise_name=exercise_name,
        target_reps=request.target_reps,
        completed_reps=request.completed_reps,
        sets=request.sets,
        weight_kg=request.weight_kg,
        form_accuracy=request.form_accuracy,
        detected_faults=request.detected_faults,
        user_context=user_context_str,
        knowledge_context=knowledge_context,
        tempo_info=tempo_info,
        history_summary=history_summary,
    ).build()

    try:
        llm = GeminiClient()
        ai_text = llm.generate(prompt)

        # Parse the AI response into structured sections using keyword markers
        sections = _parse_ai_sections(ai_text)

        knowledge = get_knowledge()
        sources: list[str] = []
        if knowledge.get_exercise_by_id(request.exercise_id):
            sources.append("exercises.json")

        return WorkoutFeedbackResponse(
            overall_feedback=sections.get("overall", ai_text),
            performance_feedback=sections.get("performance", ""),
            form_feedback=sections.get("form", ""),
            progression_feedback=sections.get("progression", ""),
            actionable_tips=sections.get("tips", []),
            safety_disclaimer=WORKOUT_DISCLAIMER.strip(),
            sources=sources,
        )

    except LLMError:
        # Graceful fallback: use knowledge-base logic without Gemini
        return _build_fallback_response(request, exercise_name)


# ---------------------------------------------------------------------------
# AI response parser
# ---------------------------------------------------------------------------

def _parse_ai_sections(text: str) -> dict:
    """
    Lightly parse numbered sections from the AI's free-text response.

    The prompt asks the model to address 5 areas in numbered order.
    We split on those markers when present, otherwise the entire text
    lands in "overall".
    """
    import re

    result: dict = {}

    # Try to extract five numbered areas from the AI response
    # Markers: 1) ... 2) ... 3) ... 4) ... 5) ...
    pattern = re.compile(r"(?:^|\n)\s*(?:\d)\s*[\)\.]\s*", re.MULTILINE)
    parts = pattern.split(text)

    if len(parts) >= 5:
        result["overall"] = parts[0].strip() or parts[1].strip()
        result["performance"] = parts[2].strip() if len(parts) > 2 else ""
        result["form"] = parts[3].strip() if len(parts) > 3 else ""
        result["progression"] = parts[4].strip() if len(parts) > 4 else ""
        tips_text = parts[5].strip() if len(parts) > 5 else ""
        # Split tips on bullet chars or newlines
        tips_raw = re.split(r"[\n•\-\*]+", tips_text)
        result["tips"] = [t.strip() for t in tips_raw if t.strip()]
    else:
        # Unstructured response — put everything in overall
        result["overall"] = text.strip()
        result["performance"] = ""
        result["form"] = ""
        result["progression"] = ""
        result["tips"] = []

    return result

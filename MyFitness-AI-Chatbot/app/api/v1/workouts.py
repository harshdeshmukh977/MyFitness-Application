"""Workouts API router for generating workout recommendations."""
from fastapi import APIRouter

from app.core.llm import GeminiClient, LLMError
from app.models.common import FitnessGoal, FitnessLevel
from app.models.workout import (
    WorkoutExerciseStep,
    WorkoutPlan,
    WorkoutSuggestRequest,
    WorkoutSuggestResponse,
)
from app.utils.knowledge import get_knowledge

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.post("/suggest", response_model=WorkoutSuggestResponse)
def suggest_workout(request: WorkoutSuggestRequest) -> WorkoutSuggestResponse:
    """Generate a personalized workout recommendation based on user profile and goals."""
    knowledge = get_knowledge()
    ctx = request.user_context

    goal = ctx.goals[0].value if ctx.goals else "maintain"
    fitness_level = ctx.fitness_level.value if ctx.fitness_level else "beginner"
    focus_area = request.focus_area.value if request.focus_area else "full_body"

    # Match closest template from knowledge base
    workouts = knowledge.filter_workouts(
        goal=goal,
        fitness_level=fitness_level,
        focus_area=focus_area,
    )

    if not workouts:
        workouts = knowledge.filter_workouts(focus_area=focus_area)
    if not workouts:
        workouts = knowledge.filter_workouts(fitness_level=fitness_level)
    if not workouts:
        workouts = knowledge.get_all_workouts()

    template = workouts[0] if workouts else None

    # Default fallback exercise steps if no template exists
    if template:
        template_name = template.get("name", "Custom Workout")
        warmup = template.get("warmup", ["5 min light cardio", "Dynamic stretching"])
        cooldown = template.get("cooldown", ["Full body stretching"])
        exercise_ids = template.get("exercise_ids", ["bodyweight_squat", "push_ups", "plank"])
    else:
        template_name = "Full Body Starter"
        warmup = ["5 min light cardio", "Dynamic stretching"]
        cooldown = ["Full body stretching"]
        exercise_ids = ["bodyweight_squat", "push_ups", "plank"]

    # Build workout exercise steps
    sets = 4 if fitness_level == "advanced" else (3 if fitness_level == "intermediate" else 2)
    reps = "12-15" if goal in ("lose_weight", "improve_endurance") else "8-12"
    rest_seconds = 45 if fitness_level == "beginner" else (90 if goal == "build_muscle" else 60)

    steps: list[WorkoutExerciseStep] = []
    for eid in exercise_ids:
        ex_info = knowledge.get_exercise_by_id(eid)
        name = ex_info["name"] if ex_info else eid.replace("_", " ").title()
        steps.append(
            WorkoutExerciseStep(
                exercise_id=eid,
                name=name,
                sets=sets,
                reps=reps,
                rest_seconds=rest_seconds,
                notes=ex_info["tips"][0] if (ex_info and ex_info.get("tips")) else None,
            )
        )

    duration = request.target_duration_minutes or (
        template.get("estimated_duration_minutes", 45) if template else 45
    )

    workout_plan = WorkoutPlan(
        name=template_name,
        goal=ctx.goals[0] if ctx.goals else FitnessGoal.MAINTAIN,
        fitness_level=ctx.fitness_level or FitnessLevel.BEGINNER,
        estimated_duration_minutes=duration,
        exercises=steps,
        warmup=warmup,
        cooldown=cooldown,
    )

    # Generate coaching tips using LLM or structured fallback
    ai_tips = (
        f"Focus on consistent form and control during all {len(steps)} exercises. "
        f"Rest {rest_seconds}s between sets. Stay hydrated and stop if you experience any sharp pain."
    )
    try:
        llm = GeminiClient()
        prompt = (
            f"Provide 2 concise coaching tips for a {fitness_level} lifter doing a {goal} workout "
            f"focusing on {focus_area}. Keep it under 40 words."
        )
        ai_tips = llm.generate(prompt)
    except (LLMError, Exception):
        pass

    return WorkoutSuggestResponse(
        workout=workout_plan,
        ai_tips=ai_tips,
        knowledge_sources=["workouts.json", "exercises.json"],
    )

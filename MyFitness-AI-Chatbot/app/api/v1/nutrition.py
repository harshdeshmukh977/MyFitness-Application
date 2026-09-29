"""Nutrition API router for food search and meal planning."""
from fastapi import APIRouter, Query

from app.core.llm import GeminiClient, LLMError
from app.models.nutrition import (
    Food,
    FoodListResponse,
    Macros,
    Meal,
    MealPlan,
    MealPlanRequest,
    MealPlanResponse,
)
from app.utils.knowledge import get_knowledge

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])


@router.get("/foods", response_model=FoodListResponse)
def list_foods(
    category: str | None = Query(default=None, description="Food category (e.g., protein, carbs, vegetables)"),
    search: str | None = Query(default=None, description="Search keyword in food name"),
    dietary_tag: str | None = Query(default=None, description="Dietary tag (e.g., vegetarian, vegan, gluten_free)"),
) -> FoodListResponse:
    """Search and filter foods in the nutrition database."""
    knowledge = get_knowledge()
    raw_foods = knowledge.filter_foods(
        category=category,
        search=search,
        dietary_tag=dietary_tag,
    )
    foods = [Food.model_validate(f) for f in raw_foods]
    return FoodListResponse(foods=foods, total=len(foods))


@router.post("/meal-plan", response_model=MealPlanResponse)
def generate_meal_plan(request: MealPlanRequest) -> MealPlanResponse:
    """Generate a daily meal plan tailored to dietary restrictions and target calories."""
    knowledge = get_knowledge()
    dietary_restrictions = request.user_context.dietary_restrictions

    # Find meals matching dietary preferences
    all_meals = knowledge.get_all_meals()
    matching_meals = all_meals
    if dietary_restrictions:
        matching_meals = [
            m for m in all_meals
            if any(tag in m.get("dietary_tags", []) for tag in dietary_restrictions)
        ]
        if not matching_meals:
            matching_meals = all_meals

    # Select distinct meals for each meal type
    meal_types = ["breakfast", "lunch", "dinner", "snack", "snack", "snack"][: request.meals_per_day]
    selected_meals: list[Meal] = []

    for mtype in meal_types:
        candidates = [m for m in matching_meals if m.get("meal_type") == mtype]
        if not candidates:
            candidates = [m for m in all_meals if m.get("meal_type") == mtype]
        if not candidates:
            candidates = matching_meals

        chosen = candidates[len(selected_meals) % len(candidates)] if candidates else None
        if chosen:
            selected_meals.append(
                Meal(
                    meal_type=chosen.get("meal_type", mtype),
                    name=chosen["name"],
                    ingredients=chosen.get("ingredients", []),
                    calories=chosen["calories"],
                    macros=Macros(
                        protein_grams=chosen["macros"]["protein_grams"],
                        carbs_grams=chosen["macros"]["carbs_grams"],
                        fat_grams=chosen["macros"]["fat_grams"],
                    ),
                    notes=chosen.get("instructions", ["Prepare and enjoy."])[0]
                    if chosen.get("instructions")
                    else None,
                )
            )

    # Compute macro totals
    total_calories = sum(m.calories for m in selected_meals)
    total_p = sum(m.macros.protein_grams for m in selected_meals)
    total_c = sum(m.macros.carbs_grams for m in selected_meals)
    total_f = sum(m.macros.fat_grams for m in selected_meals)

    # If caller supplied target daily calories, honor it in target_macros
    if request.daily_calories:
        daily_cals = request.daily_calories
        if request.macro_split:
            p_pct = request.macro_split.get("protein", 30) / 100.0
            c_pct = request.macro_split.get("carbs", 40) / 100.0
            f_pct = request.macro_split.get("fat", 30) / 100.0
            target_macros = Macros(
                protein_grams=round((daily_cals * p_pct) / 4.0, 1),
                carbs_grams=round((daily_cals * c_pct) / 4.0, 1),
                fat_grams=round((daily_cals * f_pct) / 9.0, 1),
            )
        else:
            target_macros = Macros(
                protein_grams=total_p,
                carbs_grams=total_c,
                fat_grams=total_f,
            )
    else:
        daily_cals = total_calories
        target_macros = Macros(
            protein_grams=total_p,
            carbs_grams=total_c,
            fat_grams=total_f,
        )

    meal_plan = MealPlan(
        daily_calories=daily_cals,
        target_macros=target_macros,
        meals=selected_meals,
        dietary_notes=dietary_restrictions,
    )

    ai_tips = (
        "Stay hydrated throughout the day by drinking at least 2-3 liters of water. "
        "Adjust portion sizes as needed to meet your energy demands."
    )
    try:
        llm = GeminiClient()
        prompt = (
            f"Provide 2 concise nutrition coaching tips for someone eating {daily_cals} calories "
            f"with dietary restrictions: {dietary_restrictions or 'none'}. Keep it under 40 words."
        )
        ai_tips = llm.generate(prompt)
    except (LLMError, Exception):
        pass

    return MealPlanResponse(meal_plan=meal_plan, ai_tips=ai_tips)

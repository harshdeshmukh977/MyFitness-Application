import { useState, useCallback } from "react";
import { generateMealPlan } from "../services/myfitnessClient";
import type { MealPlanRequest, MealPlanResponse } from "../services/myfitnessClient";

type State = {
  loading: boolean;
  error: string | null;
  response: MealPlanResponse | null;
};

type UseMealPlanResult = {
  execute: (params: {
    userContext: {
      fitness_level?: string;
      goals?: string[];
      dietary_restrictions?: string[];
      available_equipment?: string[];
    };
    daily_calories?: number;
    macro_split?: {
      protein: number;
      carbs: number;
      fat: number;
    };
    meals_per_day?: number;
  }) => Promise<MealPlanResponse | null>;
  reset: () => void;
};

export function useMealPlan(): UseMealPlanResult {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    response: null,
  });

  const execute = useCallback(
    async (params: {
      userContext: {
        fitness_level?: string;
        goals?: string[];
        dietary_restrictions?: string[];
        available_equipment?: string[];
      };
      daily_calories?: number;
      macro_split?: {
        protein: number;
        carbs: number;
        fat: number;
      };
      meals_per_day?: number;
    }) => {
      setState((s) => ({ ...s, loading: true, error: null }));

      const request: MealPlanRequest = {
        user_context: {
          user_id: undefined,
          fitness_level: params.userContext.fitness_level
            ? (params.userContext.fitness_level as "beginner" | "intermediate" | "advanced")
            : undefined,
          goals: (params.userContext.goals as
            | Array<"build_muscle" | "lose_weight" | "maintain" | "improve_endurance">
            | undefined) ?? [],
          available_equipment: params.userContext.available_equipment ?? [],
          dietary_restrictions: params.userContext.dietary_restrictions ?? [],
          safety_limitations: [],
          preferences: {},
        },
        daily_calories: params.daily_calories,
        macro_split: params.macro_split
          ? {
              protein: params.macro_split.protein,
              carbs: params.macro_split.carbs,
              fat: params.macro_split.fat,
            }
          : undefined,
        meals_per_day: params.meals_per_day ?? 3,
      };

      try {
        const resp = await generateMealPlan(request);
        setState({
          loading: false,
          error: null,
          response: resp,
        });
        return resp;
      } catch (e: any) {
        setState({
          loading: false,
          error: e instanceof Error ? e.message : `Meal plan error (status ${e.status ?? "unknown"})`,
          response: null,
        });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      response: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
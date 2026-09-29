import { useState, useCallback } from "react";
import { suggestWorkout } from "../services/myfitnessClient";
import type { WorkoutSuggestResponse } from "../services/myfitnessClient";

type State = {
  loading: boolean;
  error: string | null;
  response: WorkoutSuggestResponse | null;
};

type UseWorkoutSuggestResult = {
  loading: boolean;
  error: string | null;
  response: WorkoutSuggestResponse | null;
  execute: (params: {
    userContext: {
      fitness_level?: string;
      goals?: string[];
      available_equipment?: string[];
    };
    focus_area?: string;
    target_duration_minutes?: number;
  }) => Promise<WorkoutSuggestResponse | null>;
  reset: () => void;
};

export function useWorkoutSuggest(): UseWorkoutSuggestResult {
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
        available_equipment?: string[];
      };
      focus_area?: string;
      target_duration_minutes?: number;
    }) => {
      setState((s) => ({ ...s, loading: true, error: null }));

      const request = {
        user_context: {
          user_id: undefined,
          fitness_level: params.userContext.fitness_level
            ? (params.userContext.fitness_level as "beginner" | "intermediate" | "advanced")
            : undefined,
          goals: (params.userContext.goals as
            | Array<"build_muscle" | "lose_weight" | "maintain" | "improve_endurance">
            | undefined) ?? [],
          available_equipment: params.userContext.available_equipment ?? [],
          dietary_restrictions: [],
          safety_limitations: [],
          preferences: {},
        },
        focus_area: (params.focus_area as "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | "full_body" | undefined),
        target_duration_minutes: params.target_duration_minutes,
      };

      try {
        const resp = await suggestWorkout(request);
        setState({
          loading: false,
          error: null,
          response: resp,
        });
        return resp;
      } catch (e: any) {
        setState({
          loading: false,
          error: e instanceof Error ? e.message : `Workout suggestion error (status ${e.status ?? "unknown"})`,
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
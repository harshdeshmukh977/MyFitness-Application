/**
 * API service layer — thin wrapper around the MyFitness TypeScript client.
 *
 * Sets the base URL from the VITE_API_BASE_URL environment variable.
 * Falls back to http://127.0.0.1:8000 for local development.
 *
 * Usage:
 *   import { MyFitnessClient } from "./api";
 *   const client = new MyFitnessClient();
 *
 * For offline/demo mode without the backend, use the mock data from
 * src/data/demoData.ts instead of instantiating the client.
 */

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://127.0.0.1:8000";

export { BASE_URL };

// Re-export the full client for convenience
export { MyFitnessClient } from "./myfitnessClient";
export type {
  MyFitnessAPIError,
  ChatResponse,
  Exercise,
  ExerciseListResponse,
  WorkoutSuggestRequest,
  WorkoutSuggestResponse,
  WorkoutFeedbackRequest,
  WorkoutFeedbackResponse,
  WorkoutExerciseStep,
  WorkoutPlan,
  Macros,
  Food,
  FoodListResponse,
  Meal,
  MealPlan,
  MealPlanRequest,
  MealPlanResponse,
  TempoMetrics,
  SessionMetrics,
  PreviousSessionSummary,
  UserFitnessContext,
  FitnessLevel,
  FitnessGoal,
  MuscleGroup,
  Difficulty,
} from "./myfitnessClient";
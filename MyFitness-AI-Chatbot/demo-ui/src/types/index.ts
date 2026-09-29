// Re-export all types from the services layer (which wraps the client)
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
} from "../services/myfitnessClient";

export type {
  ChatMessage,
  ChatSuggestion,
  ChatRequest,
} from "./chat";
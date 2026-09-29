/**
 * MyFitness AI — Frontend TypeScript Client Module
 *
 * Reusable typed API client for React Native (Expo) and Web frontends.
 * Connects directly to the MyFitness-AI FastAPI backend.
 *
 * No API keys are required or exposed on the client side.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Base URL for the MyFitness AI backend service.
 * - Local Web / Desktop / iOS Simulator: http://127.0.0.1:8000
 * - Android Emulator: http://10.0.2.2:8000
 * - Physical Mobile Device: http://<YOUR_LOCAL_IP>:8000
 */
export const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export type FitnessGoal =
  | "build_muscle"
  | "lose_weight"
  | "maintain"
  | "improve_endurance";

export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "full_body";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface UserFitnessContext {
  user_id?: string;
  fitness_level?: FitnessLevel;
  goals?: FitnessGoal[];
  available_equipment?: string[];
  dietary_restrictions?: string[];
  safety_limitations?: string[];
  preferences?: Record<string, string>;
}

export interface ChatSuggestion {
  type: string;
  label: string;
  value: string;
}

export interface SendChatParams {
  message: string;
  session_id?: string | null;
  user_context?: UserFitnessContext;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  intent: string;
  sources: string[];
  suggestions: ChatSuggestion[];
  history_used: number;
}

export interface Exercise {
  id: string;
  name: string;
  aliases: string[];
  muscle_groups: string[];
  equipment: string[];
  difficulty: Difficulty;
  instructions: string[];
  common_mistakes: string[];
  modifications: Record<string, string>;
  tips: string[];
}

export interface ExerciseFilters {
  muscle_group?: MuscleGroup;
  equipment?: string;
  difficulty?: Difficulty;
}

export interface ExerciseListResponse {
  exercises: Exercise[];
  total: number;
  filters_applied: Record<string, string>;
}

export interface WorkoutExerciseStep {
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string | null;
}

export interface WorkoutPlan {
  name: string;
  goal: FitnessGoal | string;
  fitness_level: FitnessLevel | string;
  estimated_duration_minutes: number;
  exercises: WorkoutExerciseStep[];
  warmup: string[];
  cooldown: string[];
}

export interface WorkoutSuggestRequest {
  user_context: UserFitnessContext;
  focus_area?: MuscleGroup;
  target_duration_minutes?: number;
}

export interface WorkoutSuggestResponse {
  workout: WorkoutPlan;
  ai_tips: string;
  knowledge_sources: string[];
}

export interface Macros {
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  serving_size: string;
  calories: number;
  macros: Macros;
  dietary_tags: string[];
}

export interface FoodFilters {
  category?: string;
  search?: string;
  dietary_tag?: string;
}

export interface FoodListResponse {
  foods: Food[];
  total: number;
}

export interface Meal {
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | string;
  name: string;
  ingredients: string[];
  calories: number;
  macros: Macros;
  notes?: string | null;
}

export interface MealPlan {
  daily_calories: number;
  target_macros: Macros;
  meals: Meal[];
  dietary_notes: string[];
}

export interface MealPlanRequest {
  user_context: UserFitnessContext;
  daily_calories?: number;
  macro_split?: {
    protein: number;
    carbs: number;
    fat: number;
  } | Record<string, number>;
  meals_per_day?: number;
}

export interface MealPlanResponse {
  meal_plan: MealPlan;
  ai_tips: string;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  model: string;
}

// ---------------------------------------------------------------------------
// Workout / Rep-Counter / Pose Feedback
// ---------------------------------------------------------------------------

/**
 * Pacing and cadence metrics from computer vision or timer.
 */
export interface TempoMetrics {
  rep_duration_seconds?: number;
  eccentric_seconds?: number;
  concentric_seconds?: number;
  pause_seconds?: number;
}

/**
 * Aggregated metrics for the workout session.
 */
export interface SessionMetrics {
  duration_minutes?: number;
  total_sets?: number;
  total_reps?: number;
  perceived_exertion_rpe?: number;
  calories_burned_est?: number;
}

/**
 * Historical performance log entry for the exercise.
 */
export interface PreviousSessionSummary {
  date?: string;
  sets: number;
  reps_completed: number;
  weight_kg?: number | null;
  form_accuracy?: number | null;
}

/**
 * Request payload for POST /api/v1/feedback/workout.
 */
export interface WorkoutFeedbackRequest {
  user_context?: UserFitnessContext;
  exercise_id: string;
  exercise_name?: string | null;
  target_reps: number;
  completed_reps: number;
  sets?: number;
  weight_kg?: number | null;
  form_accuracy?: number | null;
  detected_faults?: string[];
  tempo?: TempoMetrics;
  session_metrics?: SessionMetrics;
  previous_history?: PreviousSessionSummary[];
}

/**
 * Structured response payload for POST /api/v1/feedback/workout.
 */
export interface WorkoutFeedbackResponse {
  overall_feedback: string;
  performance_feedback: string;
  form_feedback: string;
  progression_feedback: string;
  actionable_tips: string[];
  safety_disclaimer: string;
  sources: string[];
}

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

export class MyFitnessAPIError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "MyFitnessAPIError";
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// API Client Class & Functional Helpers
// ---------------------------------------------------------------------------

export class MyFitnessClient {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    // Strip trailing slashes
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Internal generic request helper with JSON parsing and error handling.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      const errorMessage =
        (typeof errorData === "object" && (errorData?.detail || errorData?.message)) ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      throw new MyFitnessAPIError(errorMessage, response.status, errorData);
    }

    return (await response.json()) as T;
  }

  // -------------------------------------------------------------------------
  // 1. Health
  // -------------------------------------------------------------------------

  /**
   * Check backend health and active model configuration.
   */
  public async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/api/v1/health", { method: "GET" });
  }

  // -------------------------------------------------------------------------
  // 2. AI Chatbot
  // -------------------------------------------------------------------------

  /**
   * Send a natural language message to the AI chatbot.
   *
   * @param params Message content, optional session_id, and optional user profile context.
   */
  public async sendChatMessage(params: SendChatParams): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Clear in-memory conversation history for a given session.
   *
   * @param sessionId Session ID to clear.
   */
  public async clearChatSession(sessionId: string): Promise<{ deleted: boolean; session_id: string }> {
    return this.request<{ deleted: boolean; session_id: string }>(
      `/api/v1/chat/${encodeURIComponent(sessionId)}`,
      { method: "DELETE" }
    );
  }

  // -------------------------------------------------------------------------
  // 3. Exercise Library
  // -------------------------------------------------------------------------

  /**
   * Browse exercises with optional filtering by muscle group, equipment, and difficulty.
   */
  public async getExercises(filters?: ExerciseFilters): Promise<ExerciseListResponse> {
    const params = new URLSearchParams();
    if (filters?.muscle_group) params.append("muscle_group", filters.muscle_group);
    if (filters?.equipment) params.append("equipment", filters.equipment);
    if (filters?.difficulty) params.append("difficulty", filters.difficulty);

    const query = params.toString();
    const endpoint = `/api/v1/exercises${query ? `?${query}` : ""}`;
    return this.request<ExerciseListResponse>(endpoint, { method: "GET" });
  }

  /**
   * Retrieve full details (instructions, coaching tips, mistakes) for a single exercise.
   */
  public async getExerciseById(id: string): Promise<Exercise> {
    return this.request<Exercise>(`/api/v1/exercises/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  }

  // -------------------------------------------------------------------------
  // 4. Workout Suggestions
  // -------------------------------------------------------------------------

  /**
   * Generate a structured workout recommendation customized to the user's fitness context.
   */
  public async suggestWorkout(params: WorkoutSuggestRequest): Promise<WorkoutSuggestResponse> {
    return this.request<WorkoutSuggestResponse>("/api/v1/workouts/suggest", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // -------------------------------------------------------------------------
  // 5. Nutrition & Meal Planning
  // -------------------------------------------------------------------------

  /**
   * Search foods by category, keyword, or dietary tag.
   */
  public async getFoods(filters?: FoodFilters): Promise<FoodListResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.dietary_tag) params.append("dietary_tag", filters.dietary_tag);

    const query = params.toString();
    const endpoint = `/api/v1/nutrition/foods${query ? `?${query}` : ""}`;
    return this.request<FoodListResponse>(endpoint, { method: "GET" });
  }

  /**
   * Generate a complete daily meal plan honoring dietary preferences and calorie targets.
   */
  public async generateMealPlan(params: MealPlanRequest): Promise<MealPlanResponse> {
    return this.request<MealPlanResponse>("/api/v1/nutrition/meal-plan", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // -------------------------------------------------------------------------
  // 6. Workout / Rep-Counter / Pose Feedback
  // -------------------------------------------------------------------------

  /**
   * Generate AI-powered coaching feedback for a completed exercise set.
   *
   * Accepts structured workout, rep-counter, and pose-detection data and
   * returns AI coaching feedback covering performance, form corrections,
   * progression insights, and actionable cues.
   * Falls back to knowledge-base-grounded logic when the Gemini API is unavailable.
   */
  public async getWorkoutFeedback(params: WorkoutFeedbackRequest): Promise<WorkoutFeedbackResponse> {
    return this.request<WorkoutFeedbackResponse>("/api/v1/feedback/workout", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}

// ---------------------------------------------------------------------------
// Exported Singleton Helper Functions (for direct imports)
// ---------------------------------------------------------------------------

const defaultClient = new MyFitnessClient();

export const sendChatMessage = (params: SendChatParams) => defaultClient.sendChatMessage(params);
export const getExercises = (filters?: ExerciseFilters) => defaultClient.getExercises(filters);
export const getExerciseById = (id: string) => defaultClient.getExerciseById(id);
export const suggestWorkout = (params: WorkoutSuggestRequest) => defaultClient.suggestWorkout(params);
export const getFoods = (filters?: FoodFilters) => defaultClient.getFoods(filters);
export const generateMealPlan = (params: MealPlanRequest) => defaultClient.generateMealPlan(params);
export const getWorkoutFeedback = (params: WorkoutFeedbackRequest) => defaultClient.getWorkoutFeedback(params);

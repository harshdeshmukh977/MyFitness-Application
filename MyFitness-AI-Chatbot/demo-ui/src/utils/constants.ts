/**
 * Application-wide constants used across the UI.
 * Keep values in sync with the FastAPI backend where applicable.
 */

export const QUERY_KEYS = {
  EXERCISES: "exercises",
  WORKOUTS: "workouts",
  CHAT: "chat",
  FEEDBACK: "feedback",
  MEAL_PLAN: "meal-plan",
};

export const STORAGE_KEYS = {
  SESSION_ID: "myfitness_coach_session_id",
  USER_CONTEXT: "myfitness_coach_user_context",
};

export const API = {
  DEFAULT_BASE_URL: "http://127.0.0.1:8000",
  ENDPOINTS: {
    CHAT: "/api/v1/chat",
    WORKOUT_SUGGEST: "/api/v1/workouts/suggest",
    WORKOUT_FEEDBACK: "/api/v1/feedback/workout",
    EXERCISES: "/api/v1/exercises",
    NUTRITION_MEAL_PLAN: "/api/v1/nutrition/meal-plan",
    HEALTH: "/api/v1/health",
  },
};

export const UI = {
  CHAT_INPUT_MAX_LENGTH: 2000,
  SUGGESTION_CHIPS_SHOWN: 3,
  AUTO_SCROLL_DELAY_MS: 150,
  FORM_ACCURACY_GOOD_THRESHOLD: 90,
  FORM_ACCURACY_LOW_REP_THRESHOLD: 75,
  FORM_ACCURACY_POOR_THRESHOLD: 75,
  PROGRESS_COMPARISON_MAX_HISTORY: 5,
};

export const ANIMATION = {
  CONFIDENCE_BURST_DURATION_MS: 1500,
  PULSE_IDLE_MS: 2000,
  LOADING_BLINK_MS: 800,
};
/**
 * Demo/mock data for the AI Coach frontend.
 * Used when the FastAPI backend is unavailable (e.g. VITE_API_BASE_URL unset
 * or ?demo=1 query param, or offline demo mode).
 *
 * Each mock entry mirrors the real API response shape so the UI renders
 * without errors. The demo covers all four states:
 *   A. Good form
 *   B. Low rep performance
 *   C. Poor form
 *   D. Improvement from previous sessions
 *
 * IMPORTANT: These are deliberately NOT derived from the real knowledge
 * base — they are standalone mock payloads. The adapter normalizes them
 * to WorkoutFeedbackRequest shapes if needed.
 */
import type {
  WorkoutFeedbackResponse,
  WorkoutSuggestResponse,
  PreviousSessionSummary,
} from "../services/myfitnessClient";

// ── Good-form mock response ──────────────────────────────────────────
export const demoGoodFormResponse: WorkoutFeedbackResponse = {
  overall_feedback: "Outstanding work! Your form was picture-perfect throughout all 12 reps. Keep maintaining that control on every set.",
  performance_feedback: "Rep target achieved. Consider progressing by adding a set or increasing the weight next session.",
  form_feedback: "Outstanding form at 95% accuracy — keep it up!",
  progression_feedback: "No previous history on file. This session will become your new baseline.",
  actionable_tips: [
    "Progress next session by adding 1 extra rep or reducing rest by 10 seconds.",
    "Maintain the same controlled tempo you've been using.",
  ],
  safety_disclaimer: "⚠️ Before starting any new exercise routine, consult with a healthcare professional. Stop immediately if you experience sharp pain, dizziness, or shortness of breath.",
  sources: ["exercises.json"],
};

// ── Low-rep performance mock response ─────────────────────────────────
export const demoLowRepResponse: WorkoutFeedbackResponse = {
  overall_feedback: "You completed 6 of 12 reps (50%) of the bench press. Keep going — the adaptation starts here.",
  performance_feedback: "You fell 6 rep(s) short of the 12-rep target. Focus on controlled tempo and bracing your core to squeeze out the remaining reps next set.",
  form_feedback: "Form accuracy 82% — solid execution with room for fine-tuning. Focus on maintaining proper alignment and controlled breathing throughout each rep.",
  progression_feedback: "No previous history on file. This session will become your new baseline.",
  actionable_tips: [
    "Use a 3-second eccentric (lowering) phase to build strength in the sticking point.",
    "Progress next session by adding 1 extra rep or reducing rest by 10 seconds.",
  ],
  safety_disclaimer: "⚠️ Before starting any new exercise routine, consult with a healthcare professional. Stop immediately if you experience sharp pain, dizziness, or shortness of breath.",
  sources: ["exercises.json"],
};

// ── Poor-form mock response ───────────────────────────────────────────
export const demoPoorFormResponse: WorkoutFeedbackResponse = {
  overall_feedback: "You completed 4 of 12 reps (33%) of the squat. Keep going — focus on quality over quantity.",
  performance_feedback: "You fell 8 rep(s) short of the 12-rep target. Focus on controlled tempo and bracing your core to squeeze out the remaining reps next set.",
  form_feedback: "Form faults detected: insufficient depth, knees caving in. Focus on quality over quantity; consider reducing weight or reps.",
  progression_feedback: "No previous history on file. This session will become your new baseline.",
  actionable_tips: [
    "Place heels on a small wedge or plates to assist depth while you build ankle flexibility.",
    "Hold a light counterweight (e.g. a 2.5 kg plate) in front of you to practise staying upright.",
    "Use a 3-second eccentric (lowering) phase to build strength in the sticking point.",
  ],
  safety_disclaimer: "⚠️ Before starting any new exercise routine, consult with a healthcare professional. Stop immediately if you experience sharp pain, dizziness, or shortness of breath.",
  sources: ["exercises.json"],
};

// ── Progress comparison mock response ──────────────────────────────────
export const demoProgressResponse: WorkoutFeedbackResponse = {
  overall_feedback: "Great effort completing all 10 reps of the lunge! You improved vs. your last logged session (8 reps) — great progressive overload!",
  performance_feedback: "You improved vs. your last logged session (8 reps) — great progressive overload!",
  form_feedback: "Form accuracy 88% — solid execution with room for fine-tuning. Focus on maintaining proper alignment and controlled breathing throughout each rep.",
  progression_feedback:
    "You improved vs. your last logged session (8 reps) — great progressive overload! Actionable: try adding 1 rep or a small amount of resistance next session.",
  actionable_tips: [
    "Progress next session by adding 1 extra rep or reducing rest by 10 seconds.",
    "Try adding a small amount of resistance (2.5 kg) if bodyweight feels easy.",
  ],
  safety_disclaimer: "⚠️ Before starting any new exercise routine, consult with a healthcare professional. Stop immediately if you experience sharp pain, dizziness, or shortness of breath.",
  sources: ["exercises.json"],
  // Attach previous_history for the progress card
  previous_history: [
    {
      date: "2026-08-25",
      sets: 3,
      reps_completed: 8,
      weight_kg: 45,
      form_accuracy: 82,
    },
    {
      date: "2026-08-27",
      sets: 3,
      reps_completed: 10,
      weight_kg: 45,
      form_accuracy: 88,
    },
  ] as PreviousSessionSummary[],
};

// ── Demo workout suggestion ───────────────────────────────────────────
export const demoWorkoutSuggestResponse: WorkoutSuggestResponse = {
  workout: {
    name: "Full Body Beginner Workout",
    goal: "build_muscle",
    fitness_level: "beginner",
    estimated_duration_minutes: 45,
    exercises: [
      {
        exercise_id: "bodyweight_squat",
        name: "Bodyweight Squat",
        sets: 3,
        reps: "12-15",
        rest_seconds: 60,
        notes: "Keep chest up, break parallel",
      },
      {
        exercise_id: "push_ups",
        name: "Push-ups",
        sets: 3,
        reps: "8-12",
        rest_seconds: 90,
        notes: "Maintain straight line from head to heels",
      },
      {
        exercise_id: "plank",
        name: "Plank",
        sets: 3,
        reps: "AMRAP",
        rest_seconds: 60,
        notes: "Engage core, don't let hips sag",
      },
    ],
    warmup: ["5 min light cardio", "Dynamic stretching"],
    cooldown: ["Full body stretching"],
  },
  ai_tips: "Focus on consistent form and control during all exercises. Rest 60-90s between sets. Stay hydrated and stop if you experience any sharp pain.",
  knowledge_sources: ["workouts.json", "exercises.json"],
};

// ── Demo chat suggestion ──────────────────────────────────────────────
export const demoChatSuggestions: Array<{ type: string; label: string; value: string }> = [
  { type: "exercise", label: "Suggest a workout", value: "Give me a beginner workout" },
  { type: "goal", label: "Set a goal", value: "How do I build muscle?" },
  { type: "exercise", label: "Ask about form", value: "Is my squat depth okay?" },
];

// ── Demo chat messages ────────────────────────────────────────────────
export const demoChatMessages: Array<{
  role: "user" | "assistant";
  content: string;
  intent?: string;
  sources?: string[];
  suggestions?: Array<{ type: string; label: string; value: string }>;
  history_used?: number;
}> = [
  {
    role: "user",
    content: "How do I improve my squat depth?",
    intent: "exercise",
    sources: ["exercises.json"],
    suggestions: [
      { type: "exercise", label: "Check form cues", value: "Squat depth cues" },
      { type: "exercise", label: "Mobility drill", value: "Ankle mobility" },
    ],
  },
  {
    role: "assistant",
    content:
      "To improve squat depth, focus on ankle mobility drills ( calf stretches, ankle circles ) and practice box squats to establish a consistent depth. Strengthen your glutes with bridges and strengthen your core to maintain upright torso position. Consistency over several weeks will yield measurable improvement.",
    intent: "exercise",
    sources: ["exercises.json"],
    suggestions: [
      { type: "exercise", label: "Box squat", value: "Box squat" },
      { type: "exercise", label: "Glute bridge", value: "Glute bridge" },
    ],
  },
];
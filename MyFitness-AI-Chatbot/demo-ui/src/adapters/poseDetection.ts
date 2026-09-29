/**
 * Adapter: normalize arbitrary pose-detection / rep-counter data into
 * the MyFitness-AI WorkoutFeedbackRequest contract.
 *
 * This keeps the UI independent of any particular future library
 * (OpenPose, MediaPipe, MoveNet, custom CV, or manual entry).
 *
 * Contract guarantee: the output always satisfies the Pydantic model
 * WorkoutFeedbackRequest on the backend. Unknown fields are passed through;
 * the backend validates the known ones.
 */
import { normalizeFaults } from "../utils/formatters";

export interface RawSessionSummary {
  date?: string;
  sets?: number;
  repsCompleted?: number;
  weightKg?: number | null;
  formAccuracy?: number | null;
}

export interface RawPoseMetrics {
  exercise_id?: string;
  exerciseId?: string;
  repCount?: number;
  targetReps?: number;
  sets?: number;
  formScore?: number;
  faults?: string[];
  weightLbs?: number;
  weightKg?: number;
  rpe?: number;
  durationSecs?: number;
  previousSessions?: RawSessionSummary[];
}

export interface NormalizedFeedback {
  exercise_id: string;
  target_reps: number;
  completed_reps: number;
  sets?: number;
  weight_kg?: number | null;
  form_accuracy?: number | null;
  detected_faults: string[];
  tempo?: {
    rep_duration_seconds?: number;
    eccentric_seconds?: number;
    concentric_seconds?: number;
    pause_seconds?: number;
  };
  session_metrics?: {
    duration_minutes?: number;
    total_sets?: number;
    total_reps?: number;
    perceived_exertion_rpe?: number;
    calories_burned_est?: number;
  };
  previous_history?: {
    date: string;
    sets: number;
    reps_completed: number;
    weight_kg?: number | null;
    form_accuracy?: number | null;
  }[];
}

export function normalizePoseMetrics(raw: RawPoseMetrics): NormalizedFeedback {
  const targetReps = raw.targetReps ?? 10;
  const completedReps = raw.repCount ?? 0;

  let formAccuracy: number | null = null;
  if (raw.formScore !== undefined && raw.formScore !== null) {
    const score = typeof raw.formScore === "number" ? raw.formScore : 0;
    const clamped = Math.max(0, Math.min(100, score));
    formAccuracy = clamped <= 1.0 ? Math.round(clamped * 100) : Math.round(clamped);
  }

  let weightKg: number | null = null;
  if (raw.weightKg !== undefined && raw.weightKg !== null) {
    weightKg = Math.round(raw.weightKg * 10) / 10;
  } else if (raw.weightLbs !== undefined && raw.weightLbs !== null) {
    weightKg = Math.round(raw.weightLbs * 0.453592 * 10) / 10;
  }

  const detectedFaults = normalizeFaults(raw.faults ?? []);

  const repDuration: number | undefined = raw.durationSecs
    ? Math.round((raw.durationSecs / Math.max(1, targetReps)) * 100) / 100
    : undefined;

  const previousHistory = raw.previousSessions
    ? raw.previousSessions.map((s) => ({
        date: s.date ?? "",
        sets: s.sets ?? 0,
        reps_completed: s.repsCompleted ?? 0,
        weight_kg: s.weightKg ?? null,
        form_accuracy: s.formAccuracy ?? null,
      }))
    : undefined;

  return {
    exercise_id: raw.exercise_id ?? raw.exerciseId ?? "bodyweight_squat",
    target_reps: targetReps,
    completed_reps: Math.max(0, completedReps),
    sets: raw.sets ?? 1,
    weight_kg: weightKg,
    form_accuracy: formAccuracy,
    detected_faults: detectedFaults,
    tempo: {
      rep_duration_seconds: repDuration,
    },
    previous_history: previousHistory,
  };
}

export function minimalNormalize(
  exerciseId: string,
  targetReps: number,
  completedReps: number,
  overrides?: {
    weightKg?: number | null;
    formAccuracy?: number | null;
    faults?: string[];
    sets?: number;
  }
): NormalizedFeedback {
  return {
    exercise_id: exerciseId,
    target_reps: targetReps,
    completed_reps: Math.max(0, completedReps),
    sets: overrides?.sets ?? 1,
    weight_kg: overrides?.weightKg ?? null,
    form_accuracy: overrides?.formAccuracy ?? null,
    detected_faults: overrides?.faults ?? [],
    tempo: undefined,
    session_metrics: undefined,
    previous_history: undefined,
  };
}
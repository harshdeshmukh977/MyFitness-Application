import { useState, useCallback } from "react";
import {
  getWorkoutFeedback,
  type WorkoutFeedbackRequest,
  type WorkoutFeedbackResponse,
} from "../services/myfitnessClient";
import { normalizePoseMetrics, minimalNormalize } from "../adapters/poseDetection";
import { UI } from "../utils/constants";

type ClassifyResult = "good" | "low" | "poor";

type State = {
  loading: boolean;
  error: string | null;
  response: WorkoutFeedbackResponse | null;
  classified: ClassifyResult;
};

type UseWorkoutFeedbackResult = {
  loading: boolean;
  error: string | null;
  response: WorkoutFeedbackResponse | null;
  classified: ClassifyResult;
  execute: (params: {
    exerciseId: string;
    targetReps: number;
    completedReps: number;
    formAccuracy?: number | null;
    detectedFaults?: string[];
    weightKg?: number | null;
    sets?: number;
    previousHistory?: {
      date: string;
      sets: number;
      reps_completed: number;
      weight_kg?: number | null;
      form_accuracy?: number | null;
    }[];
    rawPoseMetrics?: any;
    useAdapter?: boolean;
  }) => Promise<WorkoutFeedbackResponse | null>;
  reset: () => void;
};

function classifyState(
  completedReps: number,
  targetReps: number,
  formAccuracy?: number | null,
  detectedFaults?: string[]
): ClassifyResult {
  const pct = completedReps / targetReps;
  const hasFaults = detectedFaults && detectedFaults.length > 0;

  if (hasFaults || (formAccuracy !== null && formAccuracy !== undefined && formAccuracy < UI.FORM_ACCURACY_POOR_THRESHOLD)) {
    return "poor";
  }

  if (pct < 0.8 && formAccuracy !== null && formAccuracy !== undefined && formAccuracy >= UI.FORM_ACCURACY_LOW_REP_THRESHOLD) {
    return "low";
  }

  return "good";
}

export function useWorkoutFeedback(): UseWorkoutFeedbackResult {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    response: null,
    classified: "good",
  });

  const execute = useCallback(
    async (params: {
      exerciseId: string;
      targetReps: number;
      completedReps: number;
      formAccuracy?: number | null;
      detectedFaults?: string[];
      weightKg?: number | null;
      sets?: number;
      previousHistory?: {
        date: string;
        sets: number;
        reps_completed: number;
        weight_kg?: number | null;
        form_accuracy?: number | null;
      }[];
      rawPoseMetrics?: any;
      useAdapter?: boolean;
    }) => {
      setState((s) => ({ ...s, loading: true, error: null }));

      let request: WorkoutFeedbackRequest;

      if (params.useAdapter && params.rawPoseMetrics) {
        const normalized = normalizePoseMetrics(params.rawPoseMetrics);
        request = {
          exercise_id: params.exerciseId,
          target_reps: params.targetReps,
          completed_reps: params.completedReps,
          sets: params.sets ?? normalized.sets,
          weight_kg: params.weightKg ?? normalized.weight_kg,
          form_accuracy: params.formAccuracy ?? normalized.form_accuracy,
          detected_faults: params.detectedFaults ?? normalized.detected_faults,
          tempo: normalized.tempo,
          session_metrics: normalized.session_metrics,
          previous_history: normalized.previous_history,
        };
      } else {
        request = minimalNormalize(
          params.exerciseId,
          params.targetReps,
          params.completedReps,
          {
            weightKg: params.weightKg,
            formAccuracy: params.formAccuracy,
            faults: params.detectedFaults,
            sets: params.sets,
          }
        );
      }

      try {
        const resp = await getWorkoutFeedback(request);
        const classified = classifyState(
          params.completedReps,
          params.targetReps,
          params.formAccuracy,
          params.detectedFaults
        );
        setState({
          loading: false,
          error: null,
          response: resp,
          classified,
        });
        return resp;
      } catch (e: any) {
        setState({
          loading: false,
          error: e instanceof Error ? e.message : `Feedback error (status ${e.status ?? "unknown"})`,
          response: null,
          classified: "good",
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
      classified: "good",
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
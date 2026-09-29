import { FC } from "react";
import type { WorkoutSuggestResponse } from "../types";

export const WorkoutSummaryCard: FC<{
  response: WorkoutSuggestResponse | null;
  onStartWorkout?: () => void;
}> = ({ response, onStartWorkout }) => {
  if (!response) {
    return <div className="p-4 text-slate-400">No workout summary available.</div>;
  }

  const { workout, ai_tips } = response;

  return (
    <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-700">
      <h5 className="font-medium text-slate-200 mb-3 text-sm">Workout plan</h5>
      <div className="space-y-1.5 text-sm">
        {workout.exercises.map((ex, i) => (
          <div key={i} className="flex justify-between items-start">
            <span className="font-medium text-slate-200">{ex.name}</span>
            <span className="text-slate-400 text-xs">
              {ex.sets} × {ex.reps}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2.5 bg-slate-800 rounded border border-slate-600">
        <p className="text-slate-300 text-xs">{ai_tips}</p>
      </div>
      {onStartWorkout && (
        <button
          onClick={onStartWorkout}
          className="mt-2 btn-primary w-full text-sm py-1.5"
        >
          Start Workout (demo)
        </button>
      )}
    </div>
  );
};
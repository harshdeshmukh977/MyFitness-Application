import { FC } from "react";
import type { PreviousSessionSummary } from "../types";

export const ProgressComparisonCard: FC<{ previousHistory: PreviousSessionSummary[] }> = ({
  previousHistory,
}) => {
  if (!previousHistory || previousHistory.length < 2) return null;

  const sorted = [...previousHistory].sort(
    (a, b) =>
      new Date(a.date ?? "").getTime() - new Date(b.date ?? "").getTime()
  );
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];

  const repsDiff = (last.reps_completed ?? 0) - (prev.reps_completed ?? 0);
  const trend = repsDiff > 0 ? "up" : repsDiff < 0 ? "down" : "side";

  return (
    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 mt-3">
      <h5 className="font-medium text-slate-300 mb-2 text-xs">Progress comparison</h5>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-slate-500">
          Last ({last.date ?? "??"}): {last.reps_completed} × {last.sets}
        </span>
        <span>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "→"} {Math.abs(repsDiff)} reps
        </span>
      </div>
      {last.form_accuracy !== null && last.form_accuracy !== undefined && (
        <span className="text-slate-500 text-xs mt-1 block">
          Form: {Math.round(last.form_accuracy)}%
        </span>
      )}
    </div>
  );
};
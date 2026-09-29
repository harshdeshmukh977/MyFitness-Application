import { FC } from "react";
import type { WorkoutFeedbackResponse } from "../types";
import { GoodFormCard, LowRepCard, PoorFormCard, ProgressComparisonCard, SafetyNotes } from "./";

export const WorkoutFeedbackCard: FC<{
  response: WorkoutFeedbackResponse | null;
  classified: "good" | "low" | "poor";
  detectedFaults?: string[];
}> = ({ response, classified, detectedFaults }) => {
  if (!response) {
    return <div className="p-4 text-slate-400">No feedback available yet.</div>;
  }

  const borderClass = {
    good: "border-slate-700 bg-slate-900/70",
    low: "border-amber-700 bg-amber-950/30",
    poor: "border-red-700 bg-red-950/30",
  }[classified];

  return (
    <div className={`p-4 rounded-xl border ${borderClass}`}>
      {/* Overall feedback header */}
      <p className="text-slate-300 text-sm mb-3">{response.overall_feedback}</p>

      {/* Sub-card based on state */}
      {classified === "good" && <GoodFormCard response={response} />}
      {classified === "low" && <LowRepCard response={response} />}
      {classified === "poor" && <PoorFormCard response={response} detectedFaults={detectedFaults} />}

      {/* Progression comparison (if history present on response) */}
      {response.previous_history && response.previous_history.length > 0 && (
        <ProgressComparisonCard previousHistory={response.previous_history} />
      )}

      {/* Safety notes — always visible at bottom */}
      <div className="mt-3">
        <SafetyNotes
          safetyDisclaimer={response.safety_disclaimer}
          safetyLimitations={undefined}
        />
      </div>
    </div>
  );
};
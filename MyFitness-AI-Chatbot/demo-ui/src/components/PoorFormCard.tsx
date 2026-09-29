import { FC } from "react";
import type { WorkoutFeedbackResponse } from "../types";
import { getFaultDescription } from "../utils/formFaultLabels";

export const PoorFormCard: FC<{
  response: WorkoutFeedbackResponse;
  detectedFaults?: string[];
}> = ({ response, detectedFaults }) => {
  // Prefer detectedFaults prop; fall back to parsing response.form_feedback for hints
  const faults = detectedFaults && detectedFaults.length > 0
    ? detectedFaults
    : [];

  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        !
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-red-300">Form correction needed</h4>
        <p className="text-red-200 text-xs mt-1 line-clamp-3">
          {response.form_feedback}
        </p>
        {faults.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {faults.map((fault) => (
              <span
                key={fault}
                className="badge-danger"
                title={getFaultDescription(fault)}
              >
                {fault.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
        {response.progression_feedback && (
          <p className="mt-2 text-slate-400 text-xs line-clamp-2">
            {response.progression_feedback}
          </p>
        )}
        {response.actionable_tips && response.actionable_tips.length > 0 && (
          <ul className="mt-2 text-xs text-slate-300 space-y-0.5">
            {response.actionable_tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
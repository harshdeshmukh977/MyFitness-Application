import { FC } from "react";
import type { WorkoutFeedbackResponse } from "../types";

export const GoodFormCard: FC<{ response: WorkoutFeedbackResponse }> = ({ response }) => {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        ✓
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-emerald-300">Outstanding form!</h4>
        <p className="text-slate-300 text-xs mt-1">{response.form_feedback}</p>
        {response.progression_feedback && (
          <p className="mt-2 text-slate-400 text-xs">{response.progression_feedback}</p>
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
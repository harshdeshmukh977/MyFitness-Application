import { FC } from "react";
import type { WorkoutFeedbackResponse } from "../types";

export const LowRepCard: FC<{ response: WorkoutFeedbackResponse }> = ({ response }) => {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        ↓
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-amber-300">Low rep performance</h4>
        <p className="text-amber-200 text-xs mt-1 line-clamp-3">
          {response.performance_feedback}
        </p>
        {response.form_feedback && (
          <p className="mt-1 text-slate-400 text-xs line-clamp-2">
            {response.form_feedback}
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
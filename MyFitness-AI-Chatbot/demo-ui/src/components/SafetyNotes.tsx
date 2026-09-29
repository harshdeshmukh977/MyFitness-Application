import { FC } from "react";

export const SafetyNotes: FC<{
  safetyDisclaimer: string;
  safetyLimitations?: string[];
}> = ({ safetyDisclaimer, safetyLimitations }) => {
  return (
    <div className="p-2.5 bg-slate-950/50 rounded-b-lg border-t border-slate-600 text-xs text-slate-400 mt-2">
      <p className="text-slate-400 line-clamp-2">{safetyDisclaimer}</p>
      {safetyLimitations && safetyLimitations.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {safetyLimitations.map((l) => (
            <span key={l} className="chip-chip-primary text-[10px] opacity-80">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
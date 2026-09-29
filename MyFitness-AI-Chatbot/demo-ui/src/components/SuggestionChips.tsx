import { FC } from "react";
import type { ChatSuggestion } from "../types/chat";

export const SuggestionChips: FC<{
  suggestions: ChatSuggestion[];
  onSelect: (value: string) => void;
}> = ({ suggestions, onSelect }) => {
  const shown = (suggestions || []).slice(0, 3);

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {shown.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.value)}
          className="chip-chip-primary text-xs"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};
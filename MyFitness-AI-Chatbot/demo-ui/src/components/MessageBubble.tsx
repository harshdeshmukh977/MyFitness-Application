import { FC } from "react";
import type { ChatMessage } from "../types/chat";
import { SuggestionChips } from "./index";

export const MessageBubble: FC<{
  message: ChatMessage;
  onChipSelect: (value: string) => void;
}> = ({ message, onChipSelect }) => {
  const isUser = message.role === "user";
  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div className="flex max-w-[85%] flex-col">
        {/* Avatar + bubble container */}
        <div className="flex items-end gap-2">
          {!isUser && (
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              AI
            </div>
          )}
          <div
            className={`
              px-3 py-2 rounded-2xl text-sm
              ${
                isUser
                  ? "bg-emerald-600 text-white rounded-br-none"
                  : "bg-slate-800 text-slate-200 rounded-bl-none"
              }
            `}
          >
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
            <div className={`flex justify-between items-end mt-1 text-xs ${isUser ? "text-emerald-100/60" : "text-slate-400"}`}>
              {message.intent && (
                <span className="chip-chip-primary text-[10px] mr-1">
                  {message.intent}
                </span>
              )}
              {message.sources && message.sources.length > 0 && (
                <span className="text-[10px] mr-1">
                  {message.sources.map((s) => (
                    <span key={s} className="badge-primary mr-0.5">
                      {s}
                    </span>
                  ))}
                </span>
              )}
              <span className="text-[10px] opacity-60">{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Suggestion chips for assistant messages */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="ml-9 mt-1">
            <SuggestionChips suggestions={message.suggestions} onSelect={onChipSelect} />
          </div>
        )}
      </div>
    </div>
  );
};
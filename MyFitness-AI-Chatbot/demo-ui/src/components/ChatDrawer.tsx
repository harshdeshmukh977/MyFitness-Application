import { useState, useRef, useEffect } from "react";
import { MessageBubble, LoadingIndicator, ErrorState } from "./index";
import type { ChatMessage } from "../types/chat";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSend: (message: string) => void;
  onRetry: () => void;
  onChipSelect: (value: string) => void;
}

export const ChatDrawer = ({
  open,
  onClose,
  messages,
  loading,
  error,
  onSend,
  onRetry,
  onChipSelect,
}: ChatDrawerProps) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or loading
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = () => {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    onSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40
        sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 sm:max-w-md sm:rounded-2xl
        bg-slate-950 border border-slate-700 sm:shadow-2xl
        transition-all duration-300 ease-out
        ${open ? "h-full sm:h-auto sm:translate-y-0 opacity-100" : "h-0 opacity-0 pointer-events-none sm:h-0 sm:translate-y-0"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
        <span className="text-sm font-medium text-slate-200">AI Coach</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-300 text-lg leading-none p-1 rounded"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages scroll area */}
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[calc(100vh-180px)] sm:max-h-[500px]">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} onChipSelect={onChipSelect} />
        ))}
        {loading && <LoadingIndicator />}
        {error && (
          <ErrorState error={error} retry={onRetry} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 p-3 border-t border-slate-700 bg-slate-900/50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about form, workouts, or nutrition…"
          maxLength={2000}
          className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="btn-primary text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};
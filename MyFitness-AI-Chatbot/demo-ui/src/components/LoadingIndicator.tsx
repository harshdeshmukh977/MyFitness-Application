export const LoadingIndicator = () => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
        AI
      </div>
      <div className="flex-1">
        <div className="flex items-end gap-1">
          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
        </div>
        <span className="text-slate-400 text-xs mt-1 block">Thinking…</span>
      </div>
    </div>
  );
};
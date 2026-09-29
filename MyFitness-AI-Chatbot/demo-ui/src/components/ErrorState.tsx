import { FC } from "react";

export const ErrorState: FC<{ error: string; retry: () => void }> = ({ error, retry }) => {
  return (
    <div className="p-3 rounded bg-slate-900 border border-slate-600 text-sm">
      <div className="flex items-start gap-2">
        <div className="w-3 h-3 rounded-full bg-danger flex-shrink-0" />
        <span className="text-slate-300">{error}</span>
      </div>
      <button
        onClick={retry}
        className="mt-1 text-primary text-sm hover:underline"
      >
        Retry
      </button>
    </div>
  );
};
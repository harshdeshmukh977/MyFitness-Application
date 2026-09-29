import { useState, useEffect } from "react";
import { getExercises } from "../services/myfitnessClient";
import type { Exercise } from "../types";

export const ExercisePicker = ({
  onSelect,
  show = true,
  onClose,
}: {
  onSelect: (exercise: Exercise) => void;
  show?: boolean;
  onClose?: () => void;
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    getExercises({})
      .then((resp) => {
        setExercises(resp.exercises);
        setError(null);
      })
      .catch((e) => {
        setError(
          e instanceof Error ? e.message : "Failed to load exercises"
        );
        setExercises([]);
      })
      .finally(() => setLoading(false));
  }, [show]);

  const filtered = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.aliases?.some((a) => a.toLowerCase().includes(search.toLowerCase())) ??
        false)
  );

  const handleSelect = (ex: Exercise) => {
    onSelect(ex);
    onClose?.();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-slate-950 rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-md shadow-2xl overflow-y-auto max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
          <h3 className="font-medium text-slate-200">Select Exercise</h3>
          <button
            onClick={() => onClose?.()}
            className="text-slate-400 hover:text-slate-300 text-lg leading-none p-1 rounded"
            aria-label="Close picker"
          >
            ×
          </button>
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Search exercises…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {loading && <p className="text-slate-400 text-sm">Loading…</p>}
        {error && <p className="text-red-300 text-sm">Error: {error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-slate-400 text-sm">No exercises found.</p>
        )}

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelect(ex)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-600"
            >
              <div className="font-medium">{ex.name}</div>
              {ex.aliases && ex.aliases.length > 0 && (
                <div className="text-slate-500 text-xs">
                  also: {ex.aliases.join(", ")}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
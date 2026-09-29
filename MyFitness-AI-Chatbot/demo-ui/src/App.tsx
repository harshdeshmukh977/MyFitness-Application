import { useState, useEffect } from "react";
import { AIFloatingButton, ChatDrawer } from "./components";
import { useChat, useWorkoutFeedback, useWorkoutSuggest } from "./hooks";
import type { ChatMessage } from "./types/chat";
import type { Exercise } from "./types";
import { getHealth } from "./services/myfitnessClient";
import { STORAGE_KEYS } from "./utils/constants";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedExercise] = useState<Exercise | null>(null);

  const chat = useChat();
  const feedback = useWorkoutFeedback();
  const workoutSuggest = useWorkoutSuggest();

  const [userContext, setUserContext] = useState<any>(null);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_CONTEXT);
    if (stored) {
      try {
        setUserContext(JSON.parse(stored));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    getHealth()
      .then(() => setBackendAvailable(true))
      .catch(() => setBackendAvailable(false));
  }, []);

  const handleSend = (message: string) => {
    chat.execute({ message, userContext });
  };

  const handleRetry = () => {
    if (chat.error) {
      const last = chat.messages[chat.messages.length - 1];
      if (last && last.role === "user") {
        chat.execute({ message: last.content, userContext });
      }
    }
  };

  const handleChipSelect = (value: string) => {
    chat.execute({ message: value, userContext });
  };

  const handleDemoFeedback = (preset: "good" | "low" | "poor" | "progress") => {
    const templates: Record<typeof preset, { completed: number; target: number; accuracy: number | null; faults: string[] }> = {
      good: { completed: 12, target: 12, accuracy: 95, faults: [] },
      low: { completed: 6, target: 12, accuracy: 82, faults: [] },
      poor: { completed: 4, target: 12, accuracy: 62, faults: ["insufficient_depth", "knees_caving_in"] },
      progress: { completed: 10, target: 10, accuracy: 88, faults: [] },
    };
    const t = templates[preset];
    feedback.execute({
      exerciseId: selectedExercise?.id ?? "bodyweight_squat",
      targetReps: t.target,
      completedReps: t.completed,
      formAccuracy: t.accuracy,
      detectedFaults: t.faults,
      previousHistory: preset === "progress"
        ? [
            { date: "2026-08-25", sets: 3, reps_completed: 8, weight_kg: 45, form_accuracy: 82 },
            { date: "2026-08-27", sets: 3, reps_completed: 10, weight_kg: 45, form_accuracy: 88 },
          ]
        : undefined,
    });
  };

  // Combined messages for the chat drawer; append a "thinking" placeholder
  // when feedback or workout-suggest is loading, so the user sees a response.
  // When feedback completes, render the response as a message with overall_feedback content.
  const allMessages: ChatMessage[] = [
    ...chat.messages,
    ...(feedback.loading
      ? [{ role: "assistant" as const, content: "Analyzing your form…", intent: "feedback" }]
      : feedback.response
        ? [{ role: "assistant" as const, content: feedback.response.overall_feedback, intent: "feedback", sources: feedback.response.sources }]
        : []),
    ...(workoutSuggest.loading
      ? [{ role: "assistant" as const, content: "Building your workout…", intent: "workout" }]
      : []),
  ];

  const combinedLoading = chat.loading || feedback.loading || workoutSuggest.loading;
  const combinedError = chat.error ?? feedback.error ?? workoutSuggest.error;

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      {/* Background gradient — must not capture pointer events */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none -z-10"
      />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 pointer-events-none">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-3">MyFitness AI Coach</h1>
          <p className="text-slate-400 text-sm mb-8">
            Your personal AI fitness assistant. Tap the coach button at the
            bottom-right to start chatting.
          </p>
          <p
            className={`
              text-xs mt-2
              ${backendAvailable === true ? "text-emerald-400" : backendAvailable === false ? "text-red-400" : "text-slate-500"}
            `}
          >
            {backendAvailable === null
              ? "Checking backend…"
              : backendAvailable
              ? "✓ Backend connected"
              : "⚠ Offline mode — using demo data"}
          </p>
        </div>
      </main>

      <AIFloatingButton onClick={() => setDrawerOpen(true)} />

      {drawerOpen && (
        <ChatDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          messages={allMessages}
          loading={combinedLoading}
          error={combinedError}
          onSend={handleSend}
          onRetry={handleRetry}
          onChipSelect={handleChipSelect}
        />
      )}

      {/* Demo controls (visible when drawer is closed) */}
      <div className="fixed bottom-24 left-6 z-[60] flex flex-col items-start gap-2 pointer-events-auto">
        {!drawerOpen && (
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => { handleDemoFeedback("good"); setDrawerOpen(true); }}
              className="text-xs px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              Demo: Good Form
            </button>
            <button
              type="button"
              onClick={() => { handleDemoFeedback("low"); setDrawerOpen(true); }}
              className="text-xs px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
            >
              Demo: Low Reps
            </button>
            <button
              type="button"
              onClick={() => { handleDemoFeedback("poor"); setDrawerOpen(true); }}
              className="text-xs px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white cursor-pointer"
            >
              Demo: Poor Form
            </button>
            <button
              type="button"
              onClick={() => { handleDemoFeedback("progress"); setDrawerOpen(true); }}
              className="text-xs px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Demo: Progress
            </button>
          </div>
        )}
      </div>

      {feedback.response && !drawerOpen && (
        <div className="fixed top-6 right-6 z-50 w-80 max-w-sm pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-300 line-clamp-3">
                  {feedback.response.overall_feedback}
                </p>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  Open full feedback →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
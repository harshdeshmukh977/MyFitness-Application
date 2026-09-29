import { useState, useEffect, useCallback } from "react";
import {
  sendChatMessage,
  clearChatSession,
  type ChatResponse,
} from "../services/myfitnessClient";
import type { ChatMessage } from "../types/chat";
import { STORAGE_KEYS } from "../utils/constants";

type UseChatResult = {
  messages: ChatMessage[];
  sessionId: string;
  loading: boolean;
  error: string | null;
  execute: (params: {
    message: string;
    userContext?: {
      fitness_level?: string;
      goals?: string[];
      safety_limitations?: string[];
      available_equipment?: string[];
    };
  }) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
};

export function useChat(): UseChatResult {
  const [sessionId, setSessionId] = useState(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEYS.SESSION_ID)
        : null;
    return (
      stored ||
      `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    );
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    } catch {
      // offline / private browsing — ignore
    }
  }, [sessionId]);

  const execute = useCallback(
    async (params: {
      message: string;
      userContext?: {
        fitness_level?: string;
        goals?: string[];
        safety_limitations?: string[];
        available_equipment?: string[];
      };
    }) => {
      setLoading(true);
      setError(null);

      try {
        const resp: ChatResponse = await sendChatMessage({
          message: params.message,
          session_id: sessionId,
          user_context: params.userContext
            ? {
                user_id: undefined,
                fitness_level: params.userContext.fitness_level
                  ? (params.userContext.fitness_level as "beginner" | "intermediate" | "advanced")
                  : undefined,
                goals: (params.userContext.goals as
                  | Array<"build_muscle" | "lose_weight" | "maintain" | "improve_endurance">
                  | undefined) ?? [],
                available_equipment: params.userContext.available_equipment ?? [],
                safety_limitations: params.userContext.safety_limitations ?? [],
                dietary_restrictions: [],
                preferences: {},
              }
            : undefined,
        });

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: resp.message,
          intent: resp.intent,
          sources: resp.sources ?? [],
          suggestions: resp.suggestions ?? [],
          history_used: resp.history_used ?? 0,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (e: any) {
        setError(
          e instanceof Error
            ? e.message
            : `Chat error (status ${e.status ?? "unknown"})`
        );
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const clear = useCallback(async () => {
    setMessages([]);
    try {
      await clearChatSession(sessionId);
    } catch {
      // ignore — session already deleted or offline
    }
    setSessionId(
      `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    );
  }, [sessionId]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    messages,
    sessionId,
    loading,
    error,
    execute,
    clear,
    reset,
  };
}
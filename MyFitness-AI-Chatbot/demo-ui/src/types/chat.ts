/**
 * UI-local chat types.
 *
 * The MyFitness-AI TypeScript client (`myfitnessClient.ts`) uses
 * `SendChatParams` for the chat request body, which is structurally
 * identical to the backend's `ChatRequest`. We alias it here so UI
 * components can use the name `ChatRequest` (matching the backend model).
 */
import type { SendChatParams } from "../services/myfitnessClient";

export interface ChatSuggestion {
  type: string;
  label: string;
  value: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  intent?: string;
  sources?: string[];
  suggestions?: ChatSuggestion[];
  history_used?: number;
}

/** Alias so the UI layer matches the backend model naming */
export type ChatRequest = SendChatParams;
export type { ChatResponse } from "../services/myfitnessClient";
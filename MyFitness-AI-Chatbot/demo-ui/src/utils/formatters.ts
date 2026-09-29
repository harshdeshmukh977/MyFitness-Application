/**
 * Utility formatters used by the UI.
 * These are pure functions — no React/imports of client objects.
 */

/**
 * Format reps: e.g. 7/12 → "7 of 12"
 */
export function formatReps(completed: number, target: number): string {
  return `${completed} of ${target}`;
}

/**
 * Format percentage: e.g. 58 → "58%"
 */
export function formatPct(value: number): string {
  const pct = Math.round(value);
  return `${pct}%`;
}

/**
 * Format weight: assumes kg, returns string with "kg"
 */
export function formatWeightKg(weight?: number | null): string {
  if (weight === null || weight === undefined) return "—";
  return `${weight.toFixed(1)} kg`;
}

/**
 * Format duration seconds → "min s sec" or just seconds
 */
export function formatDurationSecs(totalSecs: number | null | undefined): string {
  if (totalSecs === null || totalSecs === undefined) return "—";
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins > 0) return `${mins}:${secs.toString().padStart(2, "0")} min sec`;
  return `${secs} sec`;
}

/**
 * Format form accuracy as a progress-label: "85% accuracy"
 */
export function formatFormAccuracy(value?: number | null): string {
  if (value === null || value === undefined) return "No score";
  return `${Math.round(value)}% accuracy`;
}

/**
 * Format rep completion percentage → progress bar aria-valuenow
 */
export function formatCompletionPct(completed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((completed / target) * 100);
}

/**
 * Convert raw pose detection fault keys to backend-recognized keys.
 * The adapter layer maps arbitrary detector labels to these 4 canonical keys.
 */
export const FORM_FAULT_MAPPING: Record<string, string> = {
  // Common pose-detection fault aliases → canonical backend keys
  shallow: "insufficient_depth",
  "knee_valgus": "knees_caving_in",
  spine_lean: "excessive_forward_lean",
  asymmetry: "uneven_extension",
  "forward_lean": "excessive_forward_lean",
  depth: "insufficient_depth",
  caving: "knees_caving_in",
};

/**
 * Map an arbitrary fault label array to the canonical 4-fault set.
 * Unknown faults are passed through as-is; the backend handles unknown faults
 * gracefully in the fallback response.
 */
export function normalizeFaults(rawFaults: string[]): string[] {
  if (!rawFaults || rawFaults.length === 0) return [];
  return rawFaults.map((f) => FORM_FAULT_MAPPING[f] || f);
}
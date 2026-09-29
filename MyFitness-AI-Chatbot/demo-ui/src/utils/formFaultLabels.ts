/**
 * Human-readable descriptions for each canonical form fault.
 * Used by PoorFormCard to display corrective cues.
 * Matches the labels used in app/core/prompts.py and app/api/v1/feedback.py.
 */
export const FORM_FAULT_DESCRIPTIONS: Record<string, string> = {
  insufficient_depth:
    "your squat depth needs improvement — aim to break parallel",
  excessive_forward_lean:
    "reduce forward torso lean by keeping your chest up and driving through your heels",
  knees_caving_in:
    "push your knees outward to align with your toes throughout the movement",
  uneven_extension:
    "focus on symmetrical lock-out at the top of each rep",
};

export function getFaultDescription(fault: string): string {
  return FORM_FAULT_DESCRIPTIONS[fault] || fault.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
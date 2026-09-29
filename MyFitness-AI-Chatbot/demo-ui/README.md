# MyFitness AI Coach — Standalone Demo UI

A polished standalone Vite + React + TypeScript web app that consumes the
MyFitness-AI FastAPI backend via the existing REST API contracts.

This is a **standalone integration demo**, NOT a fork or modification of the
main MyFitness application. It can be adapted later for integration into the
main app.

## What it demonstrates

- Floating AI Coach button
- WhatsApp-style slide-up chat drawer with multi-turn conversation
- User / AI message bubbles with intent + source chips
- Loading state (bouncing dots)
- Error/retry state
- Suggestion chips (tappable follow-ups)
- Workout suggestion card
- Workout feedback card with 3 sub-states:
  - **Good form** (green / celebration)
  - **Low-rep performance** (amber / encouraging)
  - **Poor form** (red / form correction)
- Previous-workout progress comparison card
- Workout summary (workout plan + AI tips)
- Safety notes
- Exercise picker (browse and select exercises for manual feedback)
- Responsive layout (mobile-first, works on desktop)

## Tech stack

- **Vite 6** (build tool, dev server)
- **React 18** + **TypeScript 5** (strict mode)
- **Tailwind CSS 3** (utility-first styling)
- **Framer Motion 11** (animations)
- **@tanstack/react-query 5** (declared as dep; available for future caching)

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Python ≥ 3.11 with `myfitness-ai` dependencies installed (for the backend)
- A `GEMINI_API_KEY` in the backend's `.env` file (only required for live AI calls)

## Running

### 1. Start the FastAPI backend

From the project root (`C:\Dev\MyFitness-AI\myfitness-ai`):

```powershell
# Install Python deps (first time only)
pip install -r requirements.txt

# Start the backend on http://127.0.0.1:8000
python -m uvicorn app.main:app --reload
```

The backend health check should respond at:
- `http://127.0.0.1:8000/api/v1/health`

### 2. Start the demo UI

From `demo-ui/`:

```powershell
# Install Node deps (first time only)
npm install

# Start the dev server on http://127.0.0.1:3000
npm run dev
```

Then open `http://127.0.0.1:3000` in a browser.

## How the demo handles the backend

- **Backend available**: All API calls go to the real FastAPI server.
  The UI shows "✓ Backend connected" in the landing area.
- **Backend unavailable**: The UI still renders. The "Demo: …" buttons in
  the bottom-right trigger the same UI flow but rely on whatever
  responses come back (or fail with the error state).
- **VITE_API_BASE_URL env var**: Override the backend URL. Default is
  `http://127.0.0.1:8000`.

```powershell
# Point at a different backend
$env:VITE_API_BASE_URL = "https://my-backend.example.com"
npm run dev
```

## Demo states

The UI has 4 demo buttons (visible when the chat drawer is closed):

1. **Demo: Good Form** — submits 12/12 reps, 95% form accuracy
2. **Demo: Low Reps** — submits 6/12 reps, 82% form accuracy
3. **Demo: Poor Form** — submits 4/12 reps, 62% accuracy, 2 detected faults
4. **Demo: Progress** — submits 10/10 reps with previous_history

Each button exercises the full `POST /api/v1/feedback/workout` flow and renders
the appropriate sub-card.

## Architecture

- `src/services/myfitnessClient.ts` — verbatim copy of the shared TS client
- `src/services/api.ts` — thin wrapper that reads `VITE_API_BASE_URL`
- `src/adapters/poseDetection.ts` — normalizes arbitrary rep-counter/pose data
  into the backend's `WorkoutFeedbackRequest` contract
- `src/hooks/` — 4 React hooks: `useChat`, `useWorkoutFeedback`, `useWorkoutSuggest`, `useMealPlan`
- `src/components/` — 14 UI components
- `src/data/demoData.ts` — offline mock responses
- `src/utils/` — formatters, fault labels, constants

## Testing

The frontend is type-checked with TypeScript strict mode:

```powershell
npm run typecheck   # tsc --noEmit
npm run build       # production build
```

The backend has its own pytest suite (140/140 passing) — run it from the
project root:

```powershell
python -m pytest
```

## Notes

- The demo UI does NOT modify the FastAPI backend, the shared
  `client/myfitnessClient.ts`, or any tests.
- It can later be moved into the main MyFitness application by copying
  the `demo-ui/` directory and updating the API base URL.
- The `poseDetection.ts` adapter is the only place that knows about
  external data formats — swap it out for the main app's data layer
  when integrating.

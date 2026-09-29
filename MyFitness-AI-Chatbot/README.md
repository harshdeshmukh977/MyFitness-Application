# MyFitness AI Module

A lightweight, modular FastAPI service providing AI-powered fitness assistance. Designed to run as a standalone prototype and integrate cleanly with the MyFitness college fitness application.

## Features

- **AI Chatbot** — Natural-language fitness Q&A with conversation memory
- **Workout Assistance** — Generate personalized workout plans
- **Exercise Information** — Browse exercise library with filters
- **Nutrition Assistance** — Food lookup and AI-generated meal plans
- **Session Context** — Multi-turn conversations retain context

## Quick Start

### 1. Clone and setup environment

```bash
cd myfitness-ai
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Run

```bash
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/chat` | Conversational AI |
| DELETE | `/api/v1/chat/{session_id}` | Clear session |
| GET | `/api/v1/exercises` | List/filter exercises |
| GET | `/api/v1/exercises/{id}` | Exercise details |
| POST | `/api/v1/workouts/suggest` | Generate workout |
| GET | `/api/v1/nutrition/foods` | Search/filter foods |
| POST | `/api/v1/nutrition/meal-plan` | Generate meal plan |

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.7-flash` | Gemini model name |
| `MAX_SESSION_MESSAGES` | No | `10` | Max messages stored per session |

## Architecture

```
User input
    ↓
Intent detection (keyword rules)
    ↓
Select relevant knowledge JSON
    ↓
Gemini + context
    ↓
Pydantic validation
    ↓
Response
```

## Project Structure

```
myfitness-ai/
├── app/
│   ├── main.py          # FastAPI app entry
│   ├── config.py        # Environment settings
│   ├── api/             # Route handlers
│   ├── core/            # LLM, prompts, session
│   ├── models/          # Pydantic schemas
│   └── utils/           # Knowledge loader
├── knowledge/           # JSON seed data
└── tests/               # pytest suite
```

## Running Tests

```bash
pytest -v
```

## Integration with Main Backend

See [INTEGRATION.md](./INTEGRATION.md) for API contract details and integration checklist.

## License

MIT

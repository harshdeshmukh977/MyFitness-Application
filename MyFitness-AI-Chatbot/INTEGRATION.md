# MyFitness AI — Integration Guide & API Contract

This document defines the interface specifications, data contracts, and integration workflows for connecting the **MyFitness AI** module with **Harsh's main backend/frontend** and **Amit's camera rep counter**.

---

## 1. Architecture & Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                 Harsh's Frontend / Client                   │
│         (React Native / Flutter / Web Application)          │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               │ Direct/Proxy HTTP Calls       │ Camera Stream & Reps
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│    MyFitness AI Service      │ │  Amit's Exercise Rep Counter │
│   (FastAPI - Port 8000)      │ │     (Computer Vision)       │
│                              │ └─────────────┬───────────────┘
│  • AI Fitness Chatbot        │               │
│  • Workout Recommendations   │               │ Uses standardized
│  • Meal Plan Generation      │               │ exercise IDs
│  • Exercise & Food Database  │◄──────────────┘
└──────────────────────────────┘
```

### Module Boundaries
- **MyFitness AI (This Service)**: Stateless REST API managing natural-language fitness Q&A, context-aware prompt orchestration, knowledge retrieval, and structured fitness recommendations.
- **Harsh's Backend / Frontend**: Owns user authentication, persistent user database, and primary UI rendering.
- **Amit's Rep Counter**: Tracks real-time form and repetition counts via camera, using the standardized exercise IDs defined in this module.

---

## 2. Server Quick Start

```bash
cd myfitness-ai
# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
# Start service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Reference**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 3. Standard Shared Data Models

### User Fitness Context (`UserFitnessContext`)
Whenever available, pass the user's fitness profile snapshot to contextualize AI responses:

```json
{
  "user_id": "usr_98765",
  "fitness_level": "intermediate",
  "goals": ["build_muscle", "lose_weight"],
  "available_equipment": ["barbell", "dumbbells", "bench"],
  "dietary_restrictions": ["vegetarian"],
  "safety_limitations": ["lower back sensitivity"],
  "preferences": {
    "units": "metric"
  }
}
```

#### Field Specifications:
- `fitness_level`: `"beginner" | "intermediate" | "advanced" | null`
- `goals`: Array of `"build_muscle" | "lose_weight" | "maintain" | "improve_endurance"`
- `available_equipment`: Array of strings (e.g. `["barbell", "dumbbells", "bodyweight", "cable_machine", "pull_up_bar"]`)
- `dietary_restrictions`: Array of strings (e.g. `["vegetarian", "vegan", "gluten_free", "dairy_free"]`)
- `safety_limitations`: Array of short tags (max 60 chars per tag)

---

## 4. API Endpoints Specification

### 4.1 Health Check
Check service status and active Gemini model.

- **`GET /api/v1/health`**
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "app_name": "MyFitness AI",
  "version": "0.1.0",
  "model": "gemini-3.7-flash"
}
```

---

### 4.2 AI Chatbot

#### Send Message
- **`POST /api/v1/chat`**
- **Request Body**:
```json
{
  "session_id": "sess_abc123",
  "message": "Can you give me 3 exercises for chest if my shoulder hurts?",
  "user_context": {
    "fitness_level": "intermediate",
    "goals": ["build_muscle"],
    "safety_limitations": ["shoulder impingement"]
  }
}
```
*Note: Pass `session_id: null` on the first message. The service will generate and return a new `session_id`.*

- **Response `200 OK`**:
```json
{
  "session_id": "sess_abc123",
  "message": "Here are 3 shoulder-friendly chest exercises...\n\n*Disclaimer: Exercise suggestions are general guidance. Consult a healthcare provider before starting.*",
  "intent": "exercise",
  "sources": ["exercises.json"],
  "suggestions": [
    {
      "type": "action",
      "label": "Show alternatives",
      "value": "alternatives"
    }
  ],
  "history_used": 2
}
```

#### Clear Session Memory
- **`DELETE /api/v1/chat/{session_id}`**
- **Response `200 OK`**:
```json
{
  "deleted": true,
  "session_id": "sess_abc123"
}
```
- **Response `404 Not Found`**: If session does not exist.

---

### 4.3 Exercise Library

#### List & Filter Exercises
- **`GET /api/v1/exercises`**
- **Query Parameters**:
  - `muscle_group` (optional): `chest`, `back`, `legs`, `shoulders`, `arms`, `core`, `full_body`
  - `equipment` (optional): e.g. `barbell`, `dumbbells`, `bodyweight`, `cable_machine`
  - `difficulty` (optional): `beginner`, `intermediate`, `advanced`
- **Example Request**: `GET /api/v1/exercises?muscle_group=chest&difficulty=beginner`
- **Response `200 OK`**:
```json
{
  "exercises": [
    {
      "id": "dumbbell_bench_press",
      "name": "Dumbbell Bench Press",
      "aliases": ["db bench"],
      "muscle_groups": ["chest", "triceps", "shoulders"],
      "equipment": ["dumbbells", "bench"],
      "difficulty": "beginner",
      "instructions": [
        "Sit on bench with dumbbells on thighs",
        "Lay back and bring dumbbells to chest level",
        "Press dumbbells up until arms extended",
        "Lower with control to chest",
        "Repeat for prescribed reps"
      ],
      "common_mistakes": ["Letting dumbbells drift apart at top", "Bouncing off chest"],
      "modifications": {
        "no_equipment": "Push-ups"
      },
      "tips": ["Keep palms facing forward"]
    }
  ],
  "total": 1,
  "filters_applied": {
    "muscle_group": "chest",
    "difficulty": "beginner"
  }
}
```

#### Get Exercise Details
- **`GET /api/v1/exercises/{exercise_id}`**
- **Example Request**: `GET /api/v1/exercises/barbell_bench_press`
- **Response `200 OK`**: Full `Exercise` object.
- **Response `404 Not Found`**: If exercise ID is invalid.

---

### 4.4 Workout Recommendations

#### Suggest Workout Plan
- **`POST /api/v1/workouts/suggest`**
- **Request Body**:
```json
{
  "user_context": {
    "fitness_level": "intermediate",
    "goals": ["build_muscle"],
    "available_equipment": ["barbell", "dumbbells", "bench"]
  },
  "focus_area": "chest",
  "target_duration_minutes": 45
}
```
- **Response `200 OK`**:
```json
{
  "workout": {
    "name": "Chest Focus Day",
    "goal": "build_muscle",
    "fitness_level": "intermediate",
    "estimated_duration_minutes": 45,
    "exercises": [
      {
        "exercise_id": "barbell_bench_press",
        "name": "Barbell Bench Press",
        "sets": 3,
        "reps": "8-12",
        "rest_seconds": 90,
        "notes": "Retract shoulder blades"
      },
      {
        "exercise_id": "incline_dumbbell_press",
        "name": "Incline Dumbbell Press",
        "sets": 3,
        "reps": "8-12",
        "rest_seconds": 90,
        "notes": "Squeeze chest at top"
      }
    ],
    "warmup": ["5 min cardio", "Band pull-aparts x 20", "Push-ups x 10"],
    "cooldown": ["Doorway chest stretch", "Standing chest stretch"]
  },
  "ai_tips": "Focus on progressive overload with clean tempo. Maintain controlled eccentric phase.",
  "knowledge_sources": ["workouts.json", "exercises.json"]
}
```

---

### 4.5 Nutrition & Meal Planning

#### Search Foods
- **`GET /api/v1/nutrition/foods`**
- **Query Parameters**:
  - `category` (optional): `protein`, `carbs`, `vegetables`, `fruit`, `fats`, `dairy`
  - `search` (optional): Keyword search (e.g. `chicken`, `oats`, `salmon`)
  - `dietary_tag` (optional): `vegetarian`, `vegan`, `gluten_free`
- **Response `200 OK`**:
```json
{
  "foods": [
    {
      "id": "chicken_breast",
      "name": "Chicken Breast",
      "category": "protein",
      "serving_size": "100g",
      "calories": 165,
      "macros": {
        "protein_grams": 31.0,
        "carbs_grams": 0.0,
        "fat_grams": 3.6
      },
      "dietary_tags": ["gluten_free", "dairy_free", "high_protein"]
    }
  ],
  "total": 1
}
```

#### Generate Meal Plan
- **`POST /api/v1/nutrition/meal-plan`**
- **Request Body**:
```json
{
  "user_context": {
    "fitness_level": "intermediate",
    "goals": ["lose_weight"],
    "dietary_restrictions": ["vegetarian"]
  },
  "daily_calories": 2000,
  "macro_split": {
    "protein": 30,
    "carbs": 40,
    "fat": 30
  },
  "meals_per_day": 3
}
```
- **Response `200 OK`**:
```json
{
  "meal_plan": {
    "daily_calories": 2000,
    "target_macros": {
      "protein_grams": 150.0,
      "carbs_grams": 200.0,
      "fat_grams": 66.7
    },
    "meals": [
      {
        "meal_type": "breakfast",
        "name": "Oatmeal with Protein & Berries",
        "ingredients": ["Oats 80g", "Whey Protein 30g", "Blueberries 50g"],
        "calories": 520,
        "macros": {
          "protein_grams": 38.0,
          "carbs_grams": 68.0,
          "fat_grams": 9.0
        },
        "notes": "Cook oats with water or milk, stir in protein powder after cooking."
      }
    ],
    "dietary_notes": ["vegetarian"]
  },
  "ai_tips": "Prioritize protein intake at every meal and keep fiber above 25g daily for satiety."
}
```

---

## 5. Integration Checklist for Team Members

### For Harsh (Main Frontend / Backend)
- [ ] Connect chat UI to `POST /api/v1/chat` and store the returned `session_id`.
- [ ] Render `suggestions` as interactive follow-up chips beneath AI messages.
- [ ] Connect exercise explorer page to `GET /api/v1/exercises`.
- [ ] Connect workout planner button to `POST /api/v1/workouts/suggest`.
- [ ] Connect meal planner view to `POST /api/v1/nutrition/meal-plan`.
- [ ] Handle standard HTTP error codes (`422` validation errors, `404` not found, `500` server errors).

### For Amit (Camera Rep Counter)
- [ ] Align exercise labels with the standardized IDs in [`knowledge/exercises.json`](./knowledge/exercises.json):
  - `bodyweight_squat`
  - `push_ups`
  - `glute_bridge`
  - `plank`
  - `forward_lunge`
  - `barbell_bench_press`
  - `barbell_back_squat`
  - `deadlift`
- [ ] Send rep counts or completed exercises into the user chat context or workout logs.

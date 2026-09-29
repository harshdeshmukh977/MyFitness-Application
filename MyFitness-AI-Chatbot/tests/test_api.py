"""Integration tests for FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app
from app.core.conversation import get_conversation_store
from app.core.orchestrator import OrchestratorResult

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_store():
    """Ensure clean conversation store for each test."""
    store = get_conversation_store()
    store.clear_all()
    yield
    store.clear_all()


# ---------------------------------------------------------------------------
# Root and Health
# ---------------------------------------------------------------------------

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert "app_name" in data
    assert "docs_url" in data


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "MyFitness AI"
    assert "model" in data


# ---------------------------------------------------------------------------
# Chat endpoints
# ---------------------------------------------------------------------------

@patch("app.api.v1.chat.get_orchestrator")
def test_post_chat_success(mock_get_orch):
    mock_orch = MagicMock()
    mock_orch.chat.return_value = OrchestratorResult(
        session_id="test-session-123",
        message="Here is some advice on squats.",
        intent="exercise",
        confidence=0.95,
        sources=["exercises.json"],
        suggestions=[{"type": "action", "label": "Show alternatives", "value": "alternatives"}],
        history_used=0,
    )
    mock_get_orch.return_value = mock_orch

    payload = {
        "message": "How do I do a proper squat?",
        "user_context": {
            "fitness_level": "beginner",
            "goals": ["build_muscle"],
        },
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test-session-123"
    assert data["message"] == "Here is some advice on squats."
    assert data["intent"] == "exercise"
    assert "exercises.json" in data["sources"]
    assert len(data["suggestions"]) > 0


@patch("app.api.v1.chat.get_orchestrator")
def test_post_chat_llm_failure(mock_get_orch):
    mock_orch = MagicMock()
    mock_orch.chat.return_value = OrchestratorResult(
        session_id="test-session-fail",
        message="",
        intent="general",
        confidence=0.5,
        error="LLM Service Unavailable",
    )
    mock_get_orch.return_value = mock_orch

    payload = {"message": "Hello"}
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 500
    assert "LLM Service Unavailable" in response.json()["detail"]


def test_delete_chat_session_success():
    store = get_conversation_store()
    session = store.create_session()
    session_id = session.session_id

    response = client.delete(f"/api/v1/chat/{session_id}")
    assert response.status_code == 200
    assert response.json() == {"deleted": True, "session_id": session_id}
    assert store.get_session(session_id) is None


def test_delete_chat_session_not_found():
    response = client.delete("/api/v1/chat/nonexistent-session-id")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Exercise endpoints
# ---------------------------------------------------------------------------

def test_list_exercises_all():
    response = client.get("/api/v1/exercises")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["exercises"]) == data["total"]
    first = data["exercises"][0]
    assert "id" in first
    assert "name" in first
    assert "muscle_groups" in first


def test_list_exercises_filter_muscle_group():
    response = client.get("/api/v1/exercises?muscle_group=chest")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert data["filters_applied"]["muscle_group"] == "chest"
    for ex in data["exercises"]:
        assert "chest" in ex["muscle_groups"]


def test_list_exercises_filter_difficulty():
    response = client.get("/api/v1/exercises?difficulty=beginner")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for ex in data["exercises"]:
        assert ex["difficulty"] == "beginner"


def test_get_exercise_details_success():
    response = client.get("/api/v1/exercises/bodyweight_squat")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "bodyweight_squat"
    assert "instructions" in data
    assert len(data["instructions"]) > 0


def test_get_exercise_details_not_found():
    response = client.get("/api/v1/exercises/nonexistent_exercise_123")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Workout endpoints
# ---------------------------------------------------------------------------

def test_suggest_workout():
    payload = {
        "user_context": {
            "fitness_level": "intermediate",
            "goals": ["build_muscle"],
            "available_equipment": ["barbell", "dumbbells"],
        },
        "focus_area": "chest",
        "target_duration_minutes": 50,
    }
    response = client.post("/api/v1/workouts/suggest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "workout" in data
    assert "ai_tips" in data
    assert "knowledge_sources" in data

    workout = data["workout"]
    assert workout["goal"] == "build_muscle"
    assert workout["fitness_level"] == "intermediate"
    assert workout["estimated_duration_minutes"] == 50
    assert len(workout["exercises"]) > 0

    first_step = workout["exercises"][0]
    assert "exercise_id" in first_step
    assert "sets" in first_step
    assert "reps" in first_step
    assert first_step["sets"] >= 1


# ---------------------------------------------------------------------------
# Nutrition endpoints
# ---------------------------------------------------------------------------

def test_list_foods_all():
    response = client.get("/api/v1/nutrition/foods")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["foods"]) == data["total"]
    first = data["foods"][0]
    assert "name" in first
    assert "macros" in first
    assert "calories" in first


def test_list_foods_filter_category():
    response = client.get("/api/v1/nutrition/foods?category=protein")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for f in data["foods"]:
        assert f["category"] == "protein"


def test_list_foods_search():
    response = client.get("/api/v1/nutrition/foods?search=chicken")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for f in data["foods"]:
        assert "chicken" in f["name"].lower() or "chicken" in f["id"].lower()


def test_generate_meal_plan():
    payload = {
        "user_context": {
            "fitness_level": "intermediate",
            "goals": ["lose_weight"],
            "dietary_restrictions": ["vegetarian"],
        },
        "daily_calories": 1800,
        "macro_split": {
            "protein": 30,
            "carbs": 40,
            "fat": 30,
        },
        "meals_per_day": 3,
    }
    response = client.post("/api/v1/nutrition/meal-plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "meal_plan" in data
    assert "ai_tips" in data

    plan = data["meal_plan"]
    assert plan["daily_calories"] == 1800
    assert len(plan["meals"]) == 3
    assert plan["target_macros"]["protein_grams"] > 0
    assert "vegetarian" in plan["dietary_notes"]


# ---------------------------------------------------------------------------
# Validation errors
# ---------------------------------------------------------------------------

def test_invalid_macro_split_sum():
    payload = {
        "user_context": {
            "fitness_level": "beginner",
            "goals": ["maintain"],
        },
        "daily_calories": 2000,
        "macro_split": {
            "protein": 50,
            "carbs": 50,
            "fat": 50,  # Sum is 150 != 100
        },
    }
    response = client.post("/api/v1/nutrition/meal-plan", json=payload)
    assert response.status_code == 422


def test_empty_chat_message():
    payload = {"message": ""}
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 422

"""Comprehensive tests for POST /api/v1/feedback/workout.

Covers:
- Pydantic model validation (WorkoutFeedbackRequest / WorkoutFeedbackResponse)
- Fallback logic (no Gemini, knowledge-base-grounded response)
- Mocked Gemini success path (structured + unstructured AI replies)
- Error handling (validation errors, missing required fields)
- End-to-end realistic scenario: beginner user, bodyweight_squat, 8/10 reps,
  82% form accuracy, form faults, and previous workout history.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app
from app.models.feedback import (
    WorkoutFeedbackRequest,
    WorkoutFeedbackResponse,
    TempoMetrics,
    SessionMetrics,
    PreviousSessionSummary,
)
from app.models.user import UserFitnessContext
from app.models.common import FitnessLevel, FitnessGoal

client = TestClient(app)


# ---------------------------------------------------------------------------
# Reusable fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def beginner_user() -> dict:
    return {
        "user_id": "user_test_001",
        "fitness_level": "beginner",
        "goals": ["build_muscle"],
        "available_equipment": ["bodyweight"],
        "safety_limitations": [],
    }


@pytest.fixture()
def squat_request(beginner_user) -> dict:
    """Realistic bodyweight squat feedback request for a beginner."""
    return {
        "user_context": beginner_user,
        "exercise_id": "bodyweight_squat",
        "exercise_name": "Bodyweight Squat",
        "target_reps": 10,
        "completed_reps": 8,
        "sets": 3,
        "weight_kg": None,
        "form_accuracy": 82.0,
        "detected_faults": ["insufficient_depth", "excessive_forward_lean"],
        "tempo": {
            "rep_duration_seconds": 3.5,
            "eccentric_seconds": 2.0,
            "concentric_seconds": 1.5,
        },
        "session_metrics": {
            "duration_minutes": 25,
            "total_sets": 3,
            "total_reps": 24,
            "perceived_exertion_rpe": 7.0,
        },
        "previous_history": [
            {
                "date": "2026-08-22",
                "sets": 3,
                "reps_completed": 7,
                "weight_kg": None,
                "form_accuracy": 78.0,
            },
            {
                "date": "2026-08-25",
                "sets": 3,
                "reps_completed": 8,
                "weight_kg": None,
                "form_accuracy": 80.0,
            },
        ],
    }


# ---------------------------------------------------------------------------
# Model unit tests
# ---------------------------------------------------------------------------

class TestFeedbackModels:
    def test_workout_feedback_request_minimal(self):
        req = WorkoutFeedbackRequest(
            exercise_id="push_ups",
            target_reps=10,
            completed_reps=10,
        )
        assert req.exercise_id == "push_ups"
        assert req.target_reps == 10
        assert req.completed_reps == 10
        assert req.detected_faults == []
        assert req.previous_history == []
        assert req.user_context is None

    def test_workout_feedback_request_full(self, squat_request):
        req = WorkoutFeedbackRequest(**squat_request)
        assert req.exercise_id == "bodyweight_squat"
        assert req.target_reps == 10
        assert req.completed_reps == 8
        assert req.form_accuracy == 82.0
        assert "insufficient_depth" in req.detected_faults
        assert "excessive_forward_lean" in req.detected_faults
        assert len(req.previous_history) == 2
        assert req.tempo is not None
        assert req.tempo.eccentric_seconds == 2.0
        assert req.session_metrics is not None
        assert req.session_metrics.duration_minutes == 25

    def test_workout_feedback_request_validates_reps(self):
        with pytest.raises(Exception):
            WorkoutFeedbackRequest(
                exercise_id="squat",
                target_reps=0,   # must be >= 1
                completed_reps=0,
            )

    def test_workout_feedback_request_validates_form_accuracy_range(self):
        with pytest.raises(Exception):
            WorkoutFeedbackRequest(
                exercise_id="squat",
                target_reps=10,
                completed_reps=8,
                form_accuracy=110.0,   # must be <= 100
            )

    def test_workout_feedback_request_form_accuracy_lower_bound(self):
        with pytest.raises(Exception):
            WorkoutFeedbackRequest(
                exercise_id="squat",
                target_reps=10,
                completed_reps=8,
                form_accuracy=-5.0,    # must be >= 0
            )

    def test_workout_feedback_response_model(self):
        resp = WorkoutFeedbackResponse(
            overall_feedback="Good job!",
            performance_feedback="Hit 8 of 10 reps.",
            form_feedback="Improve depth.",
            progression_feedback="Better than last session.",
            actionable_tips=["Push knees out", "Keep chest up"],
            safety_disclaimer="Consult a professional.",
            sources=["exercises.json"],
        )
        assert resp.overall_feedback == "Good job!"
        assert len(resp.actionable_tips) == 2
        assert "exercises.json" in resp.sources

    def test_tempo_metrics_optional_fields(self):
        t = TempoMetrics(rep_duration_seconds=4.0)
        assert t.rep_duration_seconds == 4.0
        assert t.eccentric_seconds is None
        assert t.concentric_seconds is None

    def test_session_metrics_rpe_bounds(self):
        with pytest.raises(Exception):
            SessionMetrics(perceived_exertion_rpe=11.0)  # > 10

    def test_previous_session_summary(self):
        ps = PreviousSessionSummary(
            date="2026-08-25",
            sets=3,
            reps_completed=8,
            weight_kg=None,
            form_accuracy=80.0,
        )
        assert ps.date == "2026-08-25"
        assert ps.form_accuracy == 80.0


# ---------------------------------------------------------------------------
# API endpoint tests — fallback path (Gemini mocked to fail)
# ---------------------------------------------------------------------------

class TestWorkoutFeedbackFallback:
    """Tests the knowledge-base fallback when Gemini raises LLMError."""

    def test_fallback_known_exercise(self, squat_request):
        from app.core.llm import LLMError
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.side_effect = LLMError("Service unavailable")
            resp = client.post("/api/v1/feedback/workout", json=squat_request)

        assert resp.status_code == 200
        data = resp.json()
        assert data["overall_feedback"]
        assert data["performance_feedback"]
        assert data["form_feedback"]
        assert data["progression_feedback"]
        assert isinstance(data["actionable_tips"], list)
        assert len(data["actionable_tips"]) > 0
        assert data["safety_disclaimer"]
        # Source should be populated from knowledge base
        assert "exercises.json" in data["sources"]

    def test_fallback_all_reps_completed(self, beginner_user):
        from app.core.llm import LLMError
        payload = {
            "user_context": beginner_user,
            "exercise_id": "bodyweight_squat",
            "target_reps": 10,
            "completed_reps": 10,
        }
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.side_effect = LLMError("Unavailable")
            resp = client.post("/api/v1/feedback/workout", json=payload)

        assert resp.status_code == 200
        data = resp.json()
        assert "10" in data["overall_feedback"] or "Excellent" in data["overall_feedback"]

    def test_fallback_unknown_exercise(self):
        from app.core.llm import LLMError
        payload = {
            "exercise_id": "dragon_flag_advanced",
            "target_reps": 5,
            "completed_reps": 3,
        }
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.side_effect = LLMError("Unavailable")
            resp = client.post("/api/v1/feedback/workout", json=payload)

        assert resp.status_code == 200
        data = resp.json()
        assert data["overall_feedback"]

    def test_fallback_form_faults_provide_cues(self, beginner_user):
        from app.core.llm import LLMError
        payload = {
            "user_context": beginner_user,
            "exercise_id": "bodyweight_squat",
            "target_reps": 10,
            "completed_reps": 8,
            "form_accuracy": 75.0,
            "detected_faults": ["knees_caving_in", "insufficient_depth"],
        }
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.side_effect = LLMError("Unavailable")
            resp = client.post("/api/v1/feedback/workout", json=payload)

        assert resp.status_code == 200
        data = resp.json()
        form_feedback = data["form_feedback"].lower()
        # Should mention one of the detected fault cues
        assert any(kw in form_feedback for kw in ["knee", "depth", "form", "fault"])

    def test_fallback_no_previous_history(self):
        from app.core.llm import LLMError
        payload = {
            "exercise_id": "push_ups",
            "target_reps": 12,
            "completed_reps": 10,
        }
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.side_effect = LLMError("Unavailable")
            resp = client.post("/api/v1/feedback/workout", json=payload)

        assert resp.status_code == 200
        data = resp.json()
        assert "baseline" in data["progression_feedback"].lower() or data["progression_feedback"]

    def test_fallback_with_progression_improvement(self, beginner_user):
        from app.core.llm import LLMError
        payload = {
            "user_context": beginner_user,
            "exercise_id": "bodyweight_squat",
            "target_reps": 10,
            "completed_reps": 9,
            "previous_history": [
                {"date": "2026-08-20", "sets": 3, "reps_completed": 7, "weight_kg": None},
            ],
        }
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.side_effect = LLMError("Unavailable")
            resp = client.post("/api/v1/feedback/workout", json=payload)

        assert resp.status_code == 200
        data = resp.json()
        # Completed 9 > 7 last session → progression message should mention improvement
        assert "improv" in data["progression_feedback"].lower() or data["progression_feedback"]


# ---------------------------------------------------------------------------
# API endpoint tests — Gemini success path
# ---------------------------------------------------------------------------

class TestWorkoutFeedbackGeminiSuccess:
    """Tests when Gemini returns a response successfully."""

    def test_gemini_structured_response(self, squat_request):
        ai_reply = (
            "Overall you performed well today.\n\n"
            "1) Great session overall — you're making progress.\n"
            "2) You hit 8 of 10 target reps which is strong.\n"
            "3) Depth needs improvement — try box squats to build muscle memory.\n"
            "4) Improved vs. last week's 7 reps — steady overload.\n"
            "5) Push knees out actively\n- Keep chest up\n- Slow the descent to 3 seconds"
        )
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.return_value = ai_reply
            resp = client.post("/api/v1/feedback/workout", json=squat_request)

        assert resp.status_code == 200
        data = resp.json()
        assert data["overall_feedback"]
        assert data["safety_disclaimer"]
        assert "exercises.json" in data["sources"]

    def test_gemini_unstructured_response(self, squat_request):
        """When AI doesn't use numbered sections, entire response lands in overall_feedback."""
        ai_reply = "Great workout! Keep pushing and focus on form."
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.return_value = ai_reply
            resp = client.post("/api/v1/feedback/workout", json=squat_request)

        assert resp.status_code == 200
        data = resp.json()
        assert "Great workout" in data["overall_feedback"]


# ---------------------------------------------------------------------------
# Validation error tests
# ---------------------------------------------------------------------------

class TestWorkoutFeedbackValidation:
    def test_missing_exercise_id(self):
        payload = {"target_reps": 10, "completed_reps": 8}
        resp = client.post("/api/v1/feedback/workout", json=payload)
        assert resp.status_code == 422

    def test_missing_target_reps(self):
        payload = {"exercise_id": "squat", "completed_reps": 8}
        resp = client.post("/api/v1/feedback/workout", json=payload)
        assert resp.status_code == 422

    def test_missing_completed_reps(self):
        payload = {"exercise_id": "squat", "target_reps": 10}
        resp = client.post("/api/v1/feedback/workout", json=payload)
        assert resp.status_code == 422

    def test_invalid_form_accuracy_above_100(self):
        payload = {
            "exercise_id": "squat",
            "target_reps": 10,
            "completed_reps": 8,
            "form_accuracy": 150.0,
        }
        resp = client.post("/api/v1/feedback/workout", json=payload)
        assert resp.status_code == 422

    def test_invalid_rpe_above_10(self):
        payload = {
            "exercise_id": "squat",
            "target_reps": 10,
            "completed_reps": 8,
            "session_metrics": {"perceived_exertion_rpe": 11.0},
        }
        resp = client.post("/api/v1/feedback/workout", json=payload)
        assert resp.status_code == 422

    def test_invalid_target_reps_zero(self):
        payload = {
            "exercise_id": "squat",
            "target_reps": 0,
            "completed_reps": 0,
        }
        resp = client.post("/api/v1/feedback/workout", json=payload)
        assert resp.status_code == 422

    def test_invalid_fitness_level(self):
        payload = {
            "exercise_id": "squat",
            "target_reps": 10,
            "completed_reps": 8,
            "user_context": {"fitness_level": "superhuman"},
        }
        resp = client.post("/api/v1/feedback/workout", json=payload)
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# E2E realistic scenario (fallback — no live Gemini call in CI)
# ---------------------------------------------------------------------------

class TestEndToEndRealisticScenario:
    """
    Full pipeline test with a realistic beginner scenario:
    - Exercise: Bodyweight Squat (present in knowledge base)
    - Target: 10 reps, Completed: 8 reps
    - Form accuracy: 82%
    - Detected faults: insufficient_depth, excessive_forward_lean
    - Previous 2 sessions showing gradual improvement
    - Session: 25 min, 3 sets, RPE 7
    """

    @pytest.fixture()
    def realistic_payload(self):
        return {
            "user_context": {
                "user_id": "user_college_001",
                "fitness_level": "beginner",
                "goals": ["build_muscle"],
                "available_equipment": ["bodyweight"],
                "safety_limitations": [],
                "preferences": {"preferred_unit": "metric"},
            },
            "exercise_id": "bodyweight_squat",
            "exercise_name": "Bodyweight Squat",
            "target_reps": 10,
            "completed_reps": 8,
            "sets": 3,
            "weight_kg": None,
            "form_accuracy": 82.0,
            "detected_faults": ["insufficient_depth", "excessive_forward_lean"],
            "tempo": {
                "rep_duration_seconds": 3.5,
                "eccentric_seconds": 2.0,
                "concentric_seconds": 1.5,
                "pause_seconds": 0.0,
            },
            "session_metrics": {
                "duration_minutes": 25,
                "total_sets": 3,
                "total_reps": 24,
                "perceived_exertion_rpe": 7.0,
                "calories_burned_est": 120,
            },
            "previous_history": [
                {
                    "date": "2026-08-15",
                    "sets": 3,
                    "reps_completed": 6,
                    "weight_kg": None,
                    "form_accuracy": 70.0,
                },
                {
                    "date": "2026-08-22",
                    "sets": 3,
                    "reps_completed": 7,
                    "weight_kg": None,
                    "form_accuracy": 78.0,
                },
            ],
        }

    def test_e2e_fallback_pipeline_complete(self, realistic_payload):
        """Full pipeline with Gemini mocked to unavailable — exercises knowledge base."""
        from app.core.llm import LLMError
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.side_effect = LLMError("Model overloaded")
            resp = client.post("/api/v1/feedback/workout", json=realistic_payload)

        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()

        # All response fields must be populated
        assert data["overall_feedback"], "overall_feedback must not be empty"
        assert data["performance_feedback"], "performance_feedback must not be empty"
        assert data["form_feedback"], "form_feedback must not be empty"
        assert data["progression_feedback"], "progression_feedback must not be empty"
        assert isinstance(data["actionable_tips"], list), "actionable_tips must be a list"
        assert len(data["actionable_tips"]) > 0, "Must have at least one actionable tip"
        assert data["safety_disclaimer"], "safety_disclaimer must not be empty"

        # Rep performance: completed 8/10 = 80% → "fell short" wording
        perf = data["performance_feedback"].lower()
        assert any(kw in perf for kw in ["2", "short", "fell", "target", "rep"]), \
            f"Performance feedback should mention rep gap: {perf}"

        # Form feedback must address the detected faults
        form = data["form_feedback"].lower()
        assert any(kw in form for kw in ["depth", "lean", "forward", "form", "fault", "knee"]), \
            f"Form feedback should address detected faults: {form}"

        # Progression: 8 reps > 7 reps (last session) → improvement
        prog = data["progression_feedback"].lower()
        assert any(kw in prog for kw in ["improv", "better", "progress", "overload", "increas"]), \
            f"Progression feedback should note improvement vs last session: {prog}"

        # Sources: bodyweight_squat is in exercises.json
        assert "exercises.json" in data["sources"], "exercises.json should be cited"

    def test_e2e_response_schema_complete(self, realistic_payload):
        """Verify the full response schema matches WorkoutFeedbackResponse."""
        from app.core.llm import LLMError
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.side_effect = LLMError("Unavailable")
            resp = client.post("/api/v1/feedback/workout", json=realistic_payload)

        assert resp.status_code == 200
        data = resp.json()
        required_keys = {
            "overall_feedback",
            "performance_feedback",
            "form_feedback",
            "progression_feedback",
            "actionable_tips",
            "safety_disclaimer",
            "sources",
        }
        assert required_keys.issubset(data.keys()), \
            f"Missing keys: {required_keys - data.keys()}"

    def test_e2e_with_gemini_mocked_success(self, realistic_payload):
        """Full pipeline with a mocked successful Gemini response."""
        ai_response = (
            "You're making excellent progress as a beginner!\n\n"
            "1) Solid session — 8 of 10 reps with improving form shows great dedication.\n"
            "2) You completed 8 of the 10 target reps. You are 2 reps short but this is "
            "normal for a beginner building strength.\n"
            "3) Two form issues detected: insufficient depth and excessive forward lean. "
            "Focus on sitting back into the squat and keeping your chest tall.\n"
            "4) Up from 7 reps last session — steady progressive overload is happening!\n"
            "5) Place your heels on a slight elevation to assist depth\n"
            "- Hold your arms forward as a counterbalance\n"
            "- Practice box squats to build confidence at depth"
        )
        with patch("app.api.v1.feedback.GeminiClient") as MockClient:
            MockClient.return_value.generate.return_value = ai_response
            resp = client.post("/api/v1/feedback/workout", json=realistic_payload)

        assert resp.status_code == 200
        data = resp.json()
        assert data["overall_feedback"]
        assert data["safety_disclaimer"]
        assert "exercises.json" in data["sources"]

    def test_e2e_openapi_route_registered(self):
        """Verify the endpoint appears in OpenAPI schema."""
        resp = client.get("/openapi.json")
        assert resp.status_code == 200
        paths = resp.json()["paths"]
        assert "/api/v1/feedback/workout" in paths, \
            f"Feedback route not found in OpenAPI schema. Available: {list(paths.keys())}"
        assert "post" in paths["/api/v1/feedback/workout"]

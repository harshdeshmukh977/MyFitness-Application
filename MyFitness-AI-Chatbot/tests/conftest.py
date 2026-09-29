"""Shared pytest fixtures for the test suite."""
from __future__ import annotations

import os

# Set up the Gemini API key before any app imports.
os.environ.setdefault("GEMINI_API_KEY", "test_key_for_unit_tests")

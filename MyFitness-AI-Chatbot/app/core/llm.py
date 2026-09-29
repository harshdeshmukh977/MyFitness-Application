"""Gemini API client.

Provides ``GeminiClient`` — a thin, synchronous wrapper around the Gemini
generateContent REST endpoint. No external SDK is used; requests are sent
via ``httpx`` so the exact request shape is fully controlled.

Usage
-----
    from app.core.llm import GeminiClient
    client = GeminiClient()
    text = client.generate("Hello, world")
"""
from __future__ import annotations

import json
import time
import httpx
from dataclasses import dataclass, field

from app.config import get_settings


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class LLMError(Exception):
    """Base exception for all LLM failures."""

    pass


class LLMAPIError(LLMError):
    """Raised when the Gemini API returns a non-2xx response."""

    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(f"Gemini API error {status_code}: {message}")
        self.status_code = status_code
        self.message = message


class LLMParseError(LLMError):
    """Raised when structured generation fails to parse as valid JSON."""

    def __init__(self, text: str, cause: Exception | None = None) -> None:
        super().__init__(f"Failed to parse JSON from model output: {text[:200]!r}")
        self.raw_text = text
        self.cause = cause


class LLMTimeoutError(LLMError):
    """Raised when the Gemini API request times out."""

    def __init__(self, timeout: float) -> None:
        super().__init__(f"Gemini API request timed out after {timeout}s")
        self.timeout = timeout


# ---------------------------------------------------------------------------
# Request / Response models (plain dataclasses — no pydantic needed here)
# ---------------------------------------------------------------------------

@dataclass
class GenerateConfig:
    """Configuration options for a single generation call."""

    temperature: float = 0.7
    max_output_tokens: int | None = None
    stop_sequences: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        out: dict = {"temperature": self.temperature}
        if self.max_output_tokens is not None:
            out["maxOutputTokens"] = self.max_output_tokens
        if self.stop_sequences:
            out["stopSequences"] = self.stop_sequences
        return out


@dataclass
class ContentPart:
    """A single content part (text only for now)."""

    text: str


@dataclass
class Content:
    """A single content block in the API request."""

    role: str  # "user" | "model"
    parts: list[ContentPart]

    def to_dict(self) -> dict:
        """Serialize to the API request format."""
        return _content_to_dict(self)


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------

class GeminiClient:
    """Synchronous Gemini generateContent API client.

    Parameters
    ----------
    api_key:
        Google Gemini API key. If not supplied, read from settings.
    model:
        Gemini model name (e.g. "gemini-1.5-flash"). Defaults to the
        configured ``GEMINI_MODEL`` setting.
    timeout:
        Request timeout in seconds.
    """

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        timeout: float | None = None,
    ) -> None:
        cfg = get_settings()
        self._api_key = api_key or cfg.gemini_api_key
        self._model = model or cfg.gemini_model
        self._timeout = timeout or cfg.llm_timeout_seconds

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate(
        self,
        prompt: str,
        config: GenerateConfig | None = None,
    ) -> str:
        """Generate a text response from a plain text prompt.

        Parameters
        ----------
        prompt:
            The user message / prompt to send to the model.
        config:
            Optional generation configuration.

        Returns
        -------
        str
            The model's text response.

        Raises
        ------
        LLMAPIError
            On non-2xx API responses.
        LLMTimeoutError
            On request timeout.
        LLMError
            On unexpected errors.
        """
        if config is None:
            config = GenerateConfig()
        body = self._build_body([Content(role="user", parts=[ContentPart(text=prompt)])], config)
        response = self._post(body)
        return self._extract_text(response)

    def generate_structured(
        self,
        prompt: str,
        json_schema: dict,
        config: GenerateConfig | None = None,
    ) -> dict:
        """Generate a response that conforms to a JSON schema.

        Parameters
        ----------
        prompt:
            The user message / prompt to send to the model.
        json_schema:
            A JSON Schema dict describing the expected output structure.
            The schema is injected into the request via
            ``generationConfig.responseSchema``.
        config:
            Optional generation configuration. ``temperature`` is respected;
            ``max_output_tokens`` is respected; ``stop_sequences`` is ignored.

        Returns
        -------
        dict
            The parsed JSON response from the model.

        Raises
        ------
        LLMParseError
            When the model output is not valid JSON.
        LLMAPIError / LLMTimeoutError / LLMError
            As per :meth:`generate`.
        """
        if config is None:
            config = GenerateConfig(temperature=0.3)
        else:
            config = GenerateConfig(
                temperature=config.temperature,
                max_output_tokens=config.max_output_tokens,
            )
        body = self._build_structured_body(
            [Content(role="user", parts=[ContentPart(text=prompt)])],
            json_schema,
            config,
        )
        response = self._post(body)
        raw_text = self._extract_structured_text(response)
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as exc:
            raise LLMParseError(raw_text, exc) from exc

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _build_body(
        self,
        contents: list[Content],
        config: GenerateConfig,
    ) -> dict:
        """Build the API request body for a plain text generation."""
        body: dict = {
            "contents": [_content_to_dict(c) for c in contents],
            "generationConfig": config.to_dict(),
        }
        return body

    def _build_structured_body(
        self,
        contents: list[Content],
        json_schema: dict,
        config: GenerateConfig,
    ) -> dict:
        """Build the API request body for a structured generation."""
        body: dict = {
            "contents": [_content_to_dict(c) for c in contents],
            "generationConfig": {
                **config.to_dict(),
                "responseSchema": json_schema,
                "responseMimeType": "application/json",
            },
        }
        return body

    def _post(self, body: dict) -> dict:
        """Send a POST request to the Gemini API."""
        url = (
            f"{self.BASE_URL}/{self._model}"
            f":generateContent?key={self._api_key}"
        )
        try:
            with httpx.Client(timeout=self._timeout) as client:
                resp = client.post(url=url, json=body)
        except httpx.TimeoutException:
            raise LLMTimeoutError(self._timeout) from None
        except httpx.RequestError as exc:
            raise LLMError(f"Request error: {exc}") from exc

        if not resp.is_success:
            try:
                err_body = resp.json()
                message = err_body.get("error", {}).get("message", resp.text)
            except Exception:
                message = resp.text
            raise LLMAPIError(resp.status_code, message)

        return resp.json()

    def _extract_text(self, response: dict) -> str:
        """Extract text from a standard generateContent response."""
        candidates = response.get("candidates", [])
        if not candidates:
            raise LLMError("No candidates in Gemini response")
        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            raise LLMError("No parts in Gemini response candidate")
        return "".join(p.get("text", "") for p in parts)

    def _extract_structured_text(self, response: dict) -> str:
        """Extract text from a structured generateContent response."""
        # For structured output the model returns the JSON as text in a part
        return self._extract_text(response)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _content_to_dict(content: Content) -> dict:
    return {
        "role": content.role,
        "parts": [{"text": p.text} for p in content.parts],
    }

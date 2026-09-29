"""Tests for app.core.llm."""
import pytest
from unittest.mock import patch, MagicMock

from app.core.llm import (
    GeminiClient,
    GenerateConfig,
    Content,
    ContentPart,
    LLMError,
    LLMAPIError,
    LLMParseError,
    LLMTimeoutError,
)


class TestGenerateConfig:
    def test_defaults(self) -> None:
        cfg = GenerateConfig()
        assert cfg.temperature == 0.7
        assert cfg.max_output_tokens is None
        assert cfg.stop_sequences == []

    def test_to_dict(self) -> None:
        cfg = GenerateConfig(temperature=0.5, max_output_tokens=100)
        d = cfg.to_dict()
        assert d["temperature"] == 0.5
        assert d["maxOutputTokens"] == 100
        assert "stopSequences" not in d

    def test_to_dict_with_stop(self) -> None:
        cfg = GenerateConfig(stop_sequences=["END"])
        d = cfg.to_dict()
        assert d["stopSequences"] == ["END"]


class TestContent:
    def test_to_dict(self) -> None:
        c = Content(
            role="user",
            parts=[ContentPart(text="Hello")],
        )
        d = c.to_dict()
        assert d["role"] == "user"
        assert d["parts"] == [{"text": "Hello"}]


class TestGeminiClient:
    """Tests using mocked HTTP responses so they run without a real API key."""

    @pytest.fixture
    def client(self) -> GeminiClient:
        # Use a fake key so we can patch the request
        return GeminiClient(api_key="fake-key", model="gemini-3.7-flash")

    def _mock_response(self, text: str) -> dict:
        return {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": text}],
                        "role": "model",
                    }
                }
            ]
        }

    @patch("httpx.Client")
    def test_generate_returns_text(self, mock_client_cls, client: GeminiClient) -> None:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.json.return_value = self._mock_response("Hello, world!")
        mock_instance.__enter__.return_value = mock_instance
        mock_instance.post.return_value = mock_response
        mock_client_cls.return_value = mock_instance

        result = client.generate("Say hello")
        assert result == "Hello, world!"

    @patch("httpx.Client")
    def test_generate_builds_correct_url(self, mock_client_cls, client: GeminiClient) -> None:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.json.return_value = self._mock_response("Answer")
        mock_instance.__enter__.return_value = mock_instance
        mock_instance.post.return_value = mock_response
        mock_client_cls.return_value = mock_instance

        client.generate("Test")
        call_kwargs = mock_instance.post.call_args
        url = call_kwargs.kwargs["url"]
        assert "gemini-3.7-flash" in url
        assert "generateContent" in url

    @patch("httpx.Client")
    def test_api_error_raises_llm_api_error(self, mock_client_cls, client: GeminiClient) -> None:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.is_success = False
        mock_response.status_code = 400
        mock_response.json.return_value = {"error": {"message": "Invalid API key"}}
        mock_instance.__enter__.return_value = mock_instance
        mock_instance.post.return_value = mock_response
        mock_client_cls.return_value = mock_instance

        with pytest.raises(LLMAPIError) as exc_info:
            client.generate("Hello")
        assert exc_info.value.status_code == 400
        assert "Invalid API key" in str(exc_info.value)

    @patch("httpx.Client")
    def test_timeout_raises_llm_timeout_error(self, mock_client_cls, client: GeminiClient) -> None:
        import httpx
        mock_instance = MagicMock()
        mock_instance.__enter__.return_value = mock_instance
        mock_instance.post.side_effect = httpx.TimeoutException("timed out")
        mock_client_cls.return_value = mock_instance

        with pytest.raises(LLMTimeoutError) as exc_info:
            client.generate("Hello")
        assert exc_info.value.timeout == client._timeout

    @patch("httpx.Client")
    def test_no_candidates_raises_llm_error(self, mock_client_cls, client: GeminiClient) -> None:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.json.return_value = {"candidates": []}
        mock_instance.__enter__.return_value = mock_instance
        mock_instance.post.return_value = mock_response
        mock_client_cls.return_value = mock_instance

        with pytest.raises(LLMError) as exc_info:
            client.generate("Hello")
        assert "No candidates" in str(exc_info.value)

    @patch("httpx.Client")
    def test_generate_structured_parses_json(self, mock_client_cls, client: GeminiClient) -> None:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.json.return_value = self._mock_response('{"name":"Test","count":42}')
        mock_instance.__enter__.return_value = mock_instance
        mock_instance.post.return_value = mock_response
        mock_client_cls.return_value = mock_instance

        schema = {"type": "object", "properties": {"name": {"type": "string"}, "count": {"type": "integer"}}}
        result = client.generate_structured("Give me JSON", schema)
        assert result == {"name": "Test", "count": 42}

    @patch("httpx.Client")
    def test_generate_structured_invalid_json_raises(self, mock_client_cls, client: GeminiClient) -> None:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.json.return_value = self._mock_response("not valid json")
        mock_instance.__enter__.return_value = mock_instance
        mock_instance.post.return_value = mock_response
        mock_client_cls.return_value = mock_instance

        with pytest.raises(LLMParseError) as exc_info:
            client.generate_structured("Give me JSON", {"type": "object"})
        assert "not valid json" in exc_info.value.raw_text

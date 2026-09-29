"""Chat API router for conversational fitness guidance."""
from fastapi import APIRouter, HTTPException, status

from app.core.conversation import get_conversation_store
from app.core.orchestrator import get_orchestrator
from app.models.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
def send_chat_message(request: ChatRequest) -> ChatResponse:
    """Send a message to the AI fitness chatbot and receive a contextual response."""
    orchestrator = get_orchestrator()
    user_context = (
        request.user_context.model_dump(exclude_none=True)
        if request.user_context
        else None
    )

    result = orchestrator.chat(
        message=request.message,
        session_id=request.session_id,
        user_context=user_context,
    )

    if result.error and not result.message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {result.error}",
        )

    return ChatResponse(
        session_id=result.session_id,
        message=result.message,
        intent=result.intent,
        sources=result.sources,
        suggestions=result.suggestions,
        history_used=result.history_used,
    )


@router.delete("/{session_id}", status_code=status.HTTP_200_OK)
def clear_chat_session(session_id: str) -> dict:
    """Delete a conversation session by its ID."""
    store = get_conversation_store()
    deleted = store.delete_session(session_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )
    return {"deleted": True, "session_id": session_id}

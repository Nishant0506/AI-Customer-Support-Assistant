from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter(tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Execute a RAG-powered support chat turn."""
    return ChatService.handle_chat_message(
        query=request.query,
        conversation_id=request.conversation_id,
        top_k=request.top_k,
    )

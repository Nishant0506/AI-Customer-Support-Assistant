from typing import Dict, Any, Optional
from fastapi import HTTPException

from app.core.config import settings
from app.core.logging import get_logger
from app.db.repositories.conversation_repo import ConversationRepository
from app.rag.retrieval.search import semantic_search
from app.rag.generation.answer import generate_chat_answer, summarize_conversation

logger = get_logger("services.chat")


class ChatService:
    """Orchestrates RAG support conversations, history retrieval, and LLM generation."""

    @staticmethod
    def handle_chat_message(
        query: str,
        conversation_id: Optional[int] = None,
        top_k: Optional[int] = None,
    ) -> Dict[str, Any]:
        query_clean = query.strip()
        if not query_clean:
            raise HTTPException(status_code=400, detail="Query cannot be empty.")

        if conversation_id is None:
            conversation_id = ConversationRepository.create_conversation()
            logger.info(f"Created new conversation with ID {conversation_id}")

        conversation = ConversationRepository.get_conversation(conversation_id)
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found.")

        # Load context prior to appending the new turn
        history = ConversationRepository.get_recent_messages(conversation_id, limit=10) or []

        summary = ""
        if isinstance(conversation, dict):
            summary = conversation.get("summary", "") or ""
        else:
            try:
                summary = conversation["summary"] or ""
            except Exception:
                summary = ""

        # Persist user message
        ConversationRepository.add_message(
            conversation_id=conversation_id,
            role="user",
            content=query_clean,
        )

        # Vector search
        effective_top_k = top_k or settings.TOP_K
        results = semantic_search(query_clean, top_k=effective_top_k) or []

        # Generate response
        answer = generate_chat_answer(
            query=query_clean,
            history=history,
            summary=summary,
            results=results,
        )
        if not answer:
            answer = "I could not generate an answer for that question."

        # Persist assistant response
        ConversationRepository.add_message(
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
        )

        # Check for rolling summary update threshold
        message_count = ConversationRepository.count_messages(conversation_id)
        if message_count >= 20:
            try:
                all_messages = ConversationRepository.get_recent_messages(conversation_id, limit=20)
                new_summary = summarize_conversation(all_messages)
                if new_summary:
                    ConversationRepository.update_conversation_summary(conversation_id, new_summary)
                    logger.info(f"Updated conversation summary for {conversation_id}")
            except Exception as summary_err:
                logger.warning(f"Background conversation summarization skipped: {summary_err}")

        return {
            "success": True,
            "conversation_id": conversation_id,
            "answer": answer,
            "results": results,
        }

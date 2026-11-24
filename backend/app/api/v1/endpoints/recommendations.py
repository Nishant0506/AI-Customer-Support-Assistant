from fastapi import APIRouter, HTTPException
from app.schemas.recommendation import (
    KnowledgeRecommendationRequest,
    KnowledgeRecommendationResponse,
)
from app.agents.knowledge import recommend_knowledge
from app.db.repositories.conversation_repo import ConversationRepository

router = APIRouter(tags=["Recommendations"])


@router.post("/recommendations/knowledge", response_model=KnowledgeRecommendationResponse)
def get_knowledge_recommendations(request: KnowledgeRecommendationRequest):
    """Retrieve contextual knowledge recommendations (articles, FAQs, troubleshooting steps)."""
    try:
        history = request.history or []
        if request.conversation_id is not None and not history:
            db_history = ConversationRepository.get_recent_messages(request.conversation_id, limit=10)
            if db_history:
                history = db_history

        recs = recommend_knowledge(
            message=request.message,
            history=history,
            top_k=request.top_k,
        )

        return KnowledgeRecommendationResponse(
            success=True,
            query=request.message,
            recommendations=recs,
            count=len(recs),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Recommendation retrieval failed: {type(exc).__name__}: {exc}",
        )

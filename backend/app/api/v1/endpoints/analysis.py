from fastapi import APIRouter, HTTPException
from app.schemas.analysis import AnalyzeMessageRequest, AnalyzeMessageResponse
from app.agents.intent_sentiment import analyze_customer_message
from app.db.repositories.conversation_repo import ConversationRepository

router = APIRouter(tags=["Analysis"])


@router.post("/analysis/intent-sentiment", response_model=AnalyzeMessageResponse)
def analyze_intent_and_sentiment(request: AnalyzeMessageRequest):
    """Real-time intent detection, emotion, sentiment, frustration scoring, and coaching guidance."""
    try:
        history = request.history or []
        if request.conversation_id is not None and not history:
            db_history = ConversationRepository.get_recent_messages(request.conversation_id, limit=10)
            if db_history:
                history = db_history

        analysis = analyze_customer_message(
            message=request.message,
            history=history,
        )

        return AnalyzeMessageResponse(
            success=True,
            analysis=analysis,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {type(exc).__name__}: {exc}",
        )

from fastapi import APIRouter, HTTPException
from app.schemas.summary import PostInteractionRequest
from app.agents.summary import generate_post_interaction_report

router = APIRouter(tags=["Summary"])


@router.post("/summary/post-interaction")
def post_interaction_summary(request: PostInteractionRequest):
    """Generate comprehensive post-interaction evaluation report and coaching tips."""
    try:
        report = generate_post_interaction_report(
            conversation=request.conversation,
            session_id=request.session_id,
        )
        return {"success": True, "report": report}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Summary generation failed: {type(exc).__name__}: {exc}",
        )

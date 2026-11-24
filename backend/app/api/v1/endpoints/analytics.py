from fastapi import APIRouter, HTTPException
from app.services.analytics_service import analytics_service

router = APIRouter(tags=["Analytics"])


@router.post("/analytics/session")
def save_analytics_session(report: dict):
    """Save a completed PostInteractionReport to the session analytics store."""
    try:
        record = analytics_service.save_session_report(report)
        return {"success": True, "record": record}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save session: {type(exc).__name__}: {exc}",
        )


@router.get("/analytics/dashboard")
def analytics_dashboard():
    """Aggregate all saved sessions and return performance analytics dashboard."""
    try:
        dashboard = analytics_service.get_dashboard_metrics()
        return {"success": True, "dashboard": dashboard}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Dashboard generation failed: {type(exc).__name__}: {exc}",
        )


@router.delete("/analytics/sessions")
def clear_analytics_sessions():
    """Clear all saved session records."""
    try:
        count = analytics_service.clear_all()
        return {"success": True, "deleted": count}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

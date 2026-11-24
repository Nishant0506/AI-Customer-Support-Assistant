"""
Performance Analytics Module (Task 8).
Maintains backwards compatibility for app.agents.analytics while delegating to AnalyticsService.
"""
from typing import Dict, List, Any
from app.services.analytics_service import analytics_service
from app.core.config import SESSION_STORE_PATH


def save_session(report: Dict[str, Any]) -> Dict[str, Any]:
    return analytics_service.save_session_report(report)


def get_dashboard() -> Dict[str, Any]:
    return analytics_service.get_dashboard_metrics()


def clear_all_sessions() -> int:
    return analytics_service.clear_all()


__all__ = [
    "SESSION_STORE_PATH",
    "save_session",
    "get_dashboard",
    "clear_all_sessions",
]

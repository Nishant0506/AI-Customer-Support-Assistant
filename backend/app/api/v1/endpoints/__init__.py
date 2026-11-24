"""Endpoint routers package."""
from app.api.v1.endpoints import (
    health,
    documents,
    chat,
    simulator,
    analysis,
    recommendations,
    summary,
    analytics,
)

__all__ = [
    "health",
    "documents",
    "chat",
    "simulator",
    "analysis",
    "recommendations",
    "summary",
    "analytics",
]

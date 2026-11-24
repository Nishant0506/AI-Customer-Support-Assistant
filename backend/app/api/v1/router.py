from fastapi import APIRouter

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

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(documents.router)
api_router.include_router(chat.router)
api_router.include_router(simulator.router)
api_router.include_router(analysis.router)
api_router.include_router(recommendations.router)
api_router.include_router(summary.router)
api_router.include_router(analytics.router)

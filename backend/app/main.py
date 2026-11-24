from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import get_logger
from app.db.init_db import init_db
from app.api.v1.router import api_router

logger = get_logger("app.main")


def create_application() -> FastAPI:
    """Application factory for FastAPI with middleware and modular routing."""
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
    )

    # Cross-Origin Resource Sharing
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize database schema
    init_db()

    # Register modular API router
    application.include_router(api_router)

    return application


app = create_application()

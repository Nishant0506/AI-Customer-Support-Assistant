from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def root():
    return {
        "status": "ok",
        "message": "Support RAG API is running",
    }


@router.get("/health")
def health():
    return {
        "status": "healthy",
    }

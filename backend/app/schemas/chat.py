from typing import Optional, List
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    query: str = Field(
        ...,
        min_length=1,
        description="User's question",
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of documents to retrieve",
    )


class ChatResponse(BaseModel):
    success: bool
    conversation_id: int
    answer: str
    results: list = []

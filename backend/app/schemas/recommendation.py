from typing import Optional, List
from pydantic import BaseModel, Field


class KnowledgeRecommendationItem(BaseModel):
    title: str = Field(..., description="Title of the article, FAQ, or policy")
    snippet: str = Field(..., description="Relevant text excerpt")
    category: str = Field(default="Support Article", description="Category: Policy, FAQ, Troubleshooting, or Support Article")
    score: float = Field(..., description="Relevance similarity score (0.0 to 1.0)")
    document_name: str = Field(..., description="Source document filename")
    page_number: Optional[int] = Field(default=None, description="Page number if applicable")
    actionable_summary: str = Field(default="", description="1-2 sentence key takeaway for the agent")


class KnowledgeRecommendationRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Current customer message to find knowledge for")
    conversation_id: Optional[int] = Field(default=None, description="Optional conversation ID for context formulation")
    history: Optional[list] = Field(default=None, description="Optional conversation history turns")
    top_k: int = Field(default=4, ge=1, le=10, description="Number of recommendations to retrieve")


class KnowledgeRecommendationResponse(BaseModel):
    success: bool = True
    query: str = Field(..., description="Formulated context query used for search")
    recommendations: list = Field(default=[], description="List of ranked knowledge recommendation items")
    count: int = Field(default=0, description="Total count of retrieved recommendations")

from typing import Optional, List
from pydantic import BaseModel, Field


class SentimentJourneyPoint(BaseModel):
    turn: int = Field(..., description="Turn number in the conversation")
    role: str = Field(..., description="Speaker: user or assistant")
    content_snippet: str = Field(default="", description="First 80 chars of message")
    emotion: str = Field(default="neutral", description="Detected emotion at this turn")
    frustration: int = Field(default=0, ge=0, le=10, description="Frustration score 0-10")
    sentiment: str = Field(default="neutral", description="positive / neutral / negative")
    escalation_risk: str = Field(default="low", description="low / medium / high / critical")


class ResolutionQualityScore(BaseModel):
    total: float = Field(default=0.0, ge=0.0, le=100.0, description="Composite score 0-100")
    issue_resolution: float = Field(default=0.0, ge=0.0, le=100.0)
    communication_quality: float = Field(default=0.0, ge=0.0, le=100.0)
    empathy_shown: float = Field(default=0.0, ge=0.0, le=100.0)
    guideline_adherence: float = Field(default=0.0, ge=0.0, le=100.0)


class PostInteractionReport(BaseModel):
    session_id: str = Field(default="", description="Unique session identifier")
    timestamp: str = Field(default="", description="ISO timestamp of report generation")
    total_turns: int = Field(default=0)
    customer_turns: int = Field(default=0)
    agent_turns: int = Field(default=0)
    conversation_summary: str = Field(default="", description="Concise 3-5 sentence overview")
    primary_issue: str = Field(default="", description="What the customer needed")
    final_resolution: str = Field(default="", description="How or whether it was resolved")
    resolution_status: str = Field(default="unresolved", description="resolved / partially_resolved / unresolved / escalated")
    sentiment_journey: list = Field(default=[], description="List of SentimentJourneyPoint dicts")
    resolution_quality: Optional[ResolutionQualityScore] = None
    agent_strengths: list = Field(default=[], description="What the agent did well")
    agent_weaknesses: list = Field(default=[], description="Areas needing improvement")
    coaching_recommendations: list = Field(default=[], description="Personalized coaching tips")
    max_frustration: int = Field(default=0)
    final_sentiment: str = Field(default="neutral")
    final_escalation_risk: str = Field(default="low")
    dominant_intent: str = Field(default="general_inquiry")


class PostInteractionRequest(BaseModel):
    session_id: Optional[str] = None
    conversation: list = Field(..., description="List of message dicts with role, content, analysis")


class PostInteractionResponse(BaseModel):
    success: bool = True
    report: PostInteractionReport

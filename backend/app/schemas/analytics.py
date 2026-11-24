from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class SessionRecord(BaseModel):
    session_id: str
    timestamp: str
    scenario: str = Field(default="")
    total_turns: int = Field(default=0)
    resolution_status: str = Field(default="unresolved")
    resolution_quality_total: float = Field(default=0.0)
    max_frustration: int = Field(default=0)
    final_sentiment: str = Field(default="neutral")
    final_escalation_risk: str = Field(default="low")
    dominant_intent: str = Field(default="general_inquiry")
    coaching_recommendations: list = Field(default=[])
    agent_strengths: list = Field(default=[])
    agent_weaknesses: list = Field(default=[])


class AnalyticsDashboard(BaseModel):
    total_sessions: int = Field(default=0)
    resolved_count: int = Field(default=0)
    partially_resolved_count: int = Field(default=0)
    unresolved_count: int = Field(default=0)
    escalated_count: int = Field(default=0)
    avg_resolution_quality: float = Field(default=0.0)
    avg_frustration: float = Field(default=0.0)
    resolution_trend: list = Field(default=[], description="Per-session resolution quality scores")
    escalation_frequency: dict = Field(default={}, description="Count per risk level")
    common_intents: dict = Field(default={}, description="Count per intent")
    knowledge_gaps: list = Field(default=[], description="Intents with low resolution scores")
    improvement_indicators: dict = Field(default={}, description="Trend analysis")
    top_coaching_recommendations: list = Field(default=[])
    sessions: list = Field(default=[], description="List of SessionRecord dicts")

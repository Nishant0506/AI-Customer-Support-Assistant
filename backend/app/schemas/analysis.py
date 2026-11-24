from typing import Optional, List
from pydantic import BaseModel, Field


class ResponseEvaluation(BaseModel):
    tone: int = Field(default=5, ge=1, le=5, description="Tone score (1-5)")
    clarity: int = Field(default=5, ge=1, le=5, description="Clarity score (1-5)")
    empathy: int = Field(default=5, ge=1, le=5, description="Empathy score (1-5)")
    professionalism: int = Field(default=5, ge=1, le=5, description="Professionalism score (1-5)")


class IntentSentimentAnalysis(BaseModel):
    intent: str = Field(
        ...,
        description="Detected customer intent (e.g., refund, cancellation, delivery_issue, payment_issue, account_issue, complaint, return_exchange, general_inquiry)",
    )
    emotion: str = Field(
        ...,
        description="Customer emotion (e.g., happy, neutral, confused, worried, frustrated, angry, satisfied)",
    )
    sentiment: str = Field(
        ...,
        description="Sentiment classification: positive, neutral, negative",
    )
    frustration_level: int = Field(
        ...,
        ge=0,
        le=10,
        description="Frustration score between 0 and 10",
    )
    satisfaction_trend: str = Field(
        ...,
        description="Satisfaction trend: improving, declining, or stable",
    )
    escalation_risk: str = Field(
        ...,
        description="Escalation risk assessment: low, medium, high, or critical",
    )
    escalation_reasoning: str = Field(
        default="",
        description="Reasoning for the assigned escalation risk score",
    )
    confidence: float = Field(
        default=0.9,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0",
    )
    suggested_action: str = Field(
        default="",
        description="Dynamic actionable coaching guidance tailored specifically to this message",
    )
    suggested_response: str = Field(
        default="",
        description="Recommended reply template tailored for the agent to respond with",
    )
    response_evaluation: Optional[ResponseEvaluation] = Field(
        default_factory=lambda: ResponseEvaluation(tone=5, clarity=5, empathy=5, professionalism=5),
        description="Evaluation of the agent's recent communication or suggested approach",
    )
    communication_tips: list = Field(
        default=[],
        description="List of actionable communication improvement tips",
    )


class AnalyzeMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Customer message to analyze")
    conversation_id: Optional[int] = Field(default=None, description="Optional conversation ID for history tracking")
    history: Optional[list] = Field(default=None, description="Optional explicit conversation history")


class AnalyzeMessageResponse(BaseModel):
    success: bool = True
    analysis: IntentSentimentAnalysis

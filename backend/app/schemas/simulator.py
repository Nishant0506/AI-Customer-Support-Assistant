from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.analysis import IntentSentimentAnalysis


class SimulatorConfig(BaseModel):
    persona: str = Field(default="calm", description="Customer persona (calm, angry, etc.)")
    scenario: str = Field(default="general inquiry", description="The support scenario")
    initial_emotion: str = Field(default="neutral", description="Starting emotional state")
    current_emotion: str = Field(default="neutral", description="Current emotional state")
    issue_severity: str = Field(default="low", description="Severity of the issue")
    patience_level: str = Field(default="high", description="Customer's patience level")
    expected_resolution: str = Field(default="information", description="What the customer wants")


class SimulatorTurnRequest(BaseModel):
    conversation_id: Optional[int] = None
    agent_message: str = Field(..., description="The support agent's response")
    config: SimulatorConfig


class SimulatorTurnResponse(BaseModel):
    success: bool
    conversation_id: int
    customer_message: str = Field(..., description="The simulated customer's next message")
    current_emotion: str = Field(..., description="Updated emotional state")
    patience_level: str = Field(..., description="Updated patience level")
    analysis: Optional[IntentSentimentAnalysis] = Field(
        default=None,
        description="Real-time intent and sentiment analysis of the customer message",
    )
    knowledge_recommendations: Optional[list] = Field(
        default=None,
        description="Ranked knowledge recommendations (articles, FAQs, troubleshooting steps) from RAG",
    )


SimulatorTurnResponse.model_rebuild()

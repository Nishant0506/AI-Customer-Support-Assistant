from typing import Optional
from fastapi import HTTPException

from app.core.logging import get_logger
from app.schemas.simulator import SimulatorConfig, SimulatorTurnResponse
from app.db.repositories.conversation_repo import ConversationRepository
from app.agents.simulator import generate_customer_turn
from app.agents.intent_sentiment import analyze_customer_message
from app.agents.knowledge import recommend_knowledge

logger = get_logger("services.simulator")


class SimulatorService:
    """Orchestrates customer simulator turns, emotional state, coaching, and recommendations."""

    @staticmethod
    def process_turn(
        agent_message: str,
        config: SimulatorConfig,
        conversation_id: Optional[int] = None,
    ) -> SimulatorTurnResponse:
        if conversation_id is None:
            conversation_id = ConversationRepository.create_conversation("Simulation Session")
            logger.info(f"Created new simulation conversation {conversation_id}")

        conversation = ConversationRepository.get_conversation(conversation_id)
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found.")

        # Persist agent response if not empty
        clean_agent_msg = agent_message.strip()
        if clean_agent_msg:
            ConversationRepository.add_message(
                conversation_id=conversation_id,
                role="assistant",
                content=clean_agent_msg,
            )

        history = ConversationRepository.get_recent_messages(conversation_id, limit=20) or []

        # Generate customer turn
        result = generate_customer_turn(
            agent_message=clean_agent_msg,
            history=history,
            config=config,
        )

        customer_message = result.get("customer_message", "Error generating response.")
        current_emotion = result.get("current_emotion", config.current_emotion)
        patience_level = result.get("patience_level", config.patience_level)

        # Persist simulated customer message
        ConversationRepository.add_message(
            conversation_id=conversation_id,
            role="user",
            content=customer_message,
        )

        # Run real-time intent & sentiment analysis
        analysis = analyze_customer_message(
            message=customer_message,
            history=history,
        )

        # Contextual knowledge recommendations
        knowledge_recs = recommend_knowledge(
            message=customer_message,
            history=history,
            top_k=4,
        )

        return SimulatorTurnResponse(
            success=True,
            conversation_id=conversation_id,
            customer_message=customer_message,
            current_emotion=current_emotion,
            patience_level=patience_level,
            analysis=analysis,
            knowledge_recommendations=knowledge_recs,
        )

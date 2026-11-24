from fastapi import APIRouter
from app.schemas.simulator import SimulatorTurnRequest, SimulatorTurnResponse
from app.services.simulator_service import SimulatorService

router = APIRouter(tags=["Simulator"])


@router.post("/simulator/chat", response_model=SimulatorTurnResponse)
def simulator_chat(request: SimulatorTurnRequest):
    """Execute a simulated customer interaction turn with real-time coaching analytics."""
    return SimulatorService.process_turn(
        agent_message=request.agent_message,
        config=request.config,
        conversation_id=request.conversation_id,
    )

from fastapi import APIRouter, HTTPException
from models.schemas import InsightsRequest, InsightsResponse
from services.insight_generator import generate_insights

router = APIRouter()

@router.post("/", response_model=InsightsResponse)
async def get_insights(request: InsightsRequest):
    try:
        insights = generate_insights(request.transactions, request.budgets)
        return InsightsResponse(insights=insights)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

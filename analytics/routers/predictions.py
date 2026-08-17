from fastapi import APIRouter, HTTPException
from models.schemas import PredictionsRequest, PredictionsResponse
from services.savings_predictor import predict_savings

router = APIRouter()

@router.post("/", response_model=PredictionsResponse)
async def get_predictions(request: PredictionsRequest):
    try:
        next_month, confidence, trend, model_score = predict_savings(request.monthly_data)
        return PredictionsResponse(
            next_month=next_month,
            confidence=confidence,
            trend=trend,
            model_score=model_score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

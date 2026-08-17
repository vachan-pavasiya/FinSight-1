from fastapi import APIRouter, HTTPException
from models.schemas import AnomaliesRequest, AnomaliesResponse
from services.anomaly_detector import detect_anomalies

router = APIRouter()

@router.post("/", response_model=AnomaliesResponse)
async def get_anomalies(request: AnomaliesRequest):
    try:
        anomalies = detect_anomalies(request.transactions)
        return AnomaliesResponse(anomalies=anomalies)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

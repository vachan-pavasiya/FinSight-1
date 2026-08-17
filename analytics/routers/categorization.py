from fastapi import APIRouter, HTTPException
from models.schemas import CategorizeRequest, CategorizeResponse
from services.categorizer import categorize_transactions

router = APIRouter()

@router.post("/", response_model=CategorizeResponse)
async def categorize(request: CategorizeRequest):
    try:
        categorized = categorize_transactions(request.transactions)
        return CategorizeResponse(categorized=categorized)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

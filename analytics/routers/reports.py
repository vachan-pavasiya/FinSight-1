from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.schemas import ReportRequest
from services.pdf_generator import generate_report_pdf

router = APIRouter()

@router.post("/generate")
async def generate_report(request: ReportRequest):
    try:
        pdf_bytes = generate_report_pdf(request)
        return Response(
            content=pdf_bytes, 
            media_type="application/pdf", 
            headers={"Content-Disposition": "attachment; filename=report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

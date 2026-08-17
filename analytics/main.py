# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import categorization, insights, anomalies, predictions, reports

app = FastAPI(title="FinSight Analytics API", version="1.0.0")

origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https://.*\.onrender\.com|https://.*\.vercel\.app|http://localhost:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categorization.router, prefix="/categorize", tags=["Categorization"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(anomalies.router, prefix="/anomalies", tags=["Anomalies"])
app.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
app.include_router(reports.router, prefix="/report", tags=["Reports"])

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "finsight-analytics"}

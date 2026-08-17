from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class TransactionBase(BaseModel):
    merchant: str
    amount: float
    date: datetime
    description: Optional[str] = None

class CategorizeTransaction(TransactionBase):
    pass

class CategorizeRequest(BaseModel):
    transactions: List[CategorizeTransaction]

class CategorizedTransaction(TransactionBase):
    category: str
    confidence: float

class CategorizeResponse(BaseModel):
    categorized: List[CategorizedTransaction]

class InsightTransaction(TransactionBase):
    category: str

class Budget(BaseModel):
    category: str
    amount: float

class InsightsRequest(BaseModel):
    transactions: List[InsightTransaction]
    budgets: Optional[List[Budget]] = None

class Insight(BaseModel):
    type: str
    message: str
    category: Optional[str] = None
    change: Optional[float] = None

class InsightsResponse(BaseModel):
    insights: List[Insight]

class AnomalyTransaction(InsightTransaction):
    id: str

class AnomaliesRequest(BaseModel):
    transactions: List[AnomalyTransaction]

class AnomalyDetail(AnomalyTransaction):
    reasons: List[str]
    score: float

class AnomaliesResponse(BaseModel):
    anomalies: List[AnomalyDetail]

class MonthlyData(BaseModel):
    month: int
    year: int
    income: float
    expenses: float
    savings: float

class PredictionsRequest(BaseModel):
    monthly_data: List[MonthlyData]

class PredictionNextMonth(BaseModel):
    predicted_savings: float
    predicted_income: float
    predicted_expenses: float

class PredictionsResponse(BaseModel):
    next_month: PredictionNextMonth
    confidence: float
    trend: str
    model_score: float

class UserGoal(BaseModel):
    name: str
    target: float
    current: float

class ReportPeriod(BaseModel):
    start: date
    end: date

class UserProfile(BaseModel):
    name: str
    email: str

class ReportRequest(BaseModel):
    user: UserProfile
    transactions: List[AnomalyTransaction]
    budgets: List[Budget]
    goals: List[UserGoal]
    insights: List[Insight]
    anomalies: List[AnomalyDetail]
    period: ReportPeriod

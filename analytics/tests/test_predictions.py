from models.schemas import MonthlyData
from services.savings_predictor import predict_savings

def test_perfect_linear_trend():
    data = [
        MonthlyData(month=1, year=2023, income=5000, expenses=4000, savings=1000),
        MonthlyData(month=2, year=2023, income=5000, expenses=3000, savings=2000),
        MonthlyData(month=3, year=2023, income=5000, expenses=2000, savings=3000),
        MonthlyData(month=4, year=2023, income=5000, expenses=1000, savings=4000),
    ]
    
    next_month, confidence, trend, model_score = predict_savings(data)
    
    assert 4500 <= next_month.predicted_savings <= 5500
    assert trend == "improving"

def test_minimal_data():
    data = [
        MonthlyData(month=1, year=2023, income=5000, expenses=4000, savings=1000),
        MonthlyData(month=2, year=2023, income=5000, expenses=4000, savings=1000),
        MonthlyData(month=3, year=2023, income=5000, expenses=4000, savings=1000),
    ]
    
    next_month, confidence, trend, model_score = predict_savings(data)
    
    assert next_month.predicted_savings == 1000.0

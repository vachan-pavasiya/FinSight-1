import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from models.schemas import MonthlyData, PredictionNextMonth
from typing import List, Tuple

def predict_savings(monthly_data: List[MonthlyData]) -> Tuple[PredictionNextMonth, float, str, float]:
    df = pd.DataFrame([m.model_dump() for m in monthly_data])
    
    if len(df) < 3:
        # Not enough data for regression, return naive average
        avg_savings = df['savings'].mean() if not df.empty else 0
        avg_income = df['income'].mean() if not df.empty else 0
        avg_expenses = df['expenses'].mean() if not df.empty else 0
        
        return PredictionNextMonth(
            predicted_savings=avg_savings,
            predicted_income=avg_income,
            predicted_expenses=avg_expenses
        ), 0.5, "stable", 0.0

    df = df.sort_values(by=['year', 'month']).reset_index(drop=True)
    X = np.arange(len(df)).reshape(-1, 1)
    
    predictions = {}
    model_scores = []
    
    for target in ['savings', 'income', 'expenses']:
        y = df[target].values
        model = LinearRegression()
        model.fit(X, y)
        next_month_idx = np.array([[len(df)]])
        pred = model.predict(next_month_idx)[0]
        predictions[target] = float(pred)
        
        # Calculate R^2 score if variance exists
        if np.var(y) > 0:
            model_scores.append(model.score(X, y))
        else:
            model_scores.append(0.0)

    avg_score = sum(model_scores) / len(model_scores)
    
    # Trend based on savings slope
    y_savings = df['savings'].values
    model_savings = LinearRegression()
    model_savings.fit(X, y_savings)
    slope = model_savings.coef_[0]
    
    if slope > 100:
        trend = "improving"
    elif slope < -100:
        trend = "declining"
    else:
        trend = "stable"
        
    confidence = min(0.95, 0.5 + 0.4 * avg_score)
    
    next_month = PredictionNextMonth(
        predicted_savings=predictions['savings'],
        predicted_income=predictions['income'],
        predicted_expenses=predictions['expenses']
    )
    
    return next_month, confidence, trend, avg_score

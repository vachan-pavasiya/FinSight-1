import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from models.schemas import AnomalyTransaction, AnomalyDetail
from typing import List

def detect_anomalies(transactions: List[AnomalyTransaction]) -> List[AnomalyDetail]:
    if not transactions:
        return []
        
    df = pd.DataFrame([tx.model_dump() for tx in transactions])
    df['date_dt'] = pd.to_datetime(df['date'])
    df['amount_abs'] = df['amount'].abs()
    
    # Needs at least some variation to run models
    if len(df) < 5:
        return []

    df['hour_of_day'] = df['date_dt'].dt.hour
    df['day_of_week'] = df['date_dt'].dt.dayofweek
    
    # 1. Isolation Forest
    X = df[['amount_abs', 'hour_of_day', 'day_of_week']].fillna(0)
    iso_forest = IsolationForest(contamination=0.05, random_state=42)
    df['iso_outlier'] = iso_forest.fit_predict(X) == -1
    
    # 2. Z-score
    amounts = df['amount_abs']
    std_dev = amounts.std()
    if std_dev > 0:
        df['z_score_outlier'] = (amounts - amounts.mean()).abs() / std_dev > 3
    else:
        df['z_score_outlier'] = False
        
    # 3. IQR
    Q1 = amounts.quantile(0.25)
    Q3 = amounts.quantile(0.75)
    IQR = Q3 - Q1
    df['iqr_outlier'] = amounts > (Q3 + 1.5 * IQR)
    
    # 4. Business rules
    df['midnight_tx'] = (df['hour_of_day'] >= 0) & (df['hour_of_day'] < 4)
    
    # Duplicate amounts same merchant within 24h
    df = df.sort_values(by=['merchant', 'date_dt'])
    df['time_diff'] = df.groupby('merchant')['date_dt'].diff()
    df['amt_diff'] = df.groupby('merchant')['amount_abs'].diff()
    df['duplicate_tx'] = (df['time_diff'] <= pd.Timedelta(days=1)) & (df['amt_diff'] == 0)
    
    median_amt = amounts.median()
    df['high_amt_rule'] = amounts > (3 * median_amt)
    
    anomalies = []
    
    for _, row in df.iterrows():
        reasons = []
        model_flags = sum([row['iso_outlier'], row['z_score_outlier'], row['iqr_outlier']])
        business_flags = sum([row['midnight_tx'], row['duplicate_tx'], row['high_amt_rule']])
        
        if model_flags >= 2 or business_flags >= 1:
            if row['iso_outlier']: reasons.append('isolation_forest')
            if row['z_score_outlier']: reasons.append('high_z_score')
            if row['iqr_outlier']: reasons.append('high_iqr')
            if row['midnight_tx']: reasons.append('midnight_transaction')
            if row['duplicate_tx']: reasons.append('duplicate_transaction')
            if row['high_amt_rule']: reasons.append('high_amount')
            
            score = min(1.0, 0.5 + 0.1 * model_flags + 0.2 * business_flags)
            
            tx_dict = {k: v for k, v in row.to_dict().items() if k in AnomalyTransaction.model_fields}
            tx_dict['date'] = tx_dict['date'].date() if isinstance(tx_dict['date'], pd.Timestamp) else tx_dict['date']
            anomalies.append(AnomalyDetail(**tx_dict, reasons=reasons, score=score))
            
    return anomalies

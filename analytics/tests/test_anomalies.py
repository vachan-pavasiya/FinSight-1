import pytest
from models.schemas import AnomalyTransaction
from services.anomaly_detector import detect_anomalies
from datetime import date, datetime, timedelta
import random

def test_outliers_flagged():
    normal_date = datetime.now().replace(hour=12, minute=0, second=0, microsecond=0)
    normal_txs = [
        AnomalyTransaction(id=f"n{i}", merchant="Grocery", amount=-100 + random.uniform(-10, 10), date=normal_date, category="Food")
        for i in range(100)
    ]
    outliers = [
        AnomalyTransaction(id=f"o{i}", merchant="Luxury", amount=-10000, date=normal_date, category="Shopping")
        for i in range(5)
    ]
    
    all_txs = normal_txs + outliers
    results = detect_anomalies(all_txs)
    
    anomalous_ids = [r.id for r in results]
    
    for i in range(5):
        assert f"o{i}" in anomalous_ids

    # Assert < 10% false positives
    false_positives = [r for r in results if r.id.startswith("n")]
    assert len(false_positives) < 10

def test_midnight_transaction():
    txs = [
        AnomalyTransaction(id="1", merchant="Store", amount=-100, date="2023-10-10T02:30:00", category="Shopping"),
        AnomalyTransaction(id="2", merchant="Store", amount=-100, date="2023-10-10T12:30:00", category="Shopping")
    ]
    # needs 5 transactions for model to not return empty
    txs.extend([AnomalyTransaction(id=f"{i}", merchant="Store", amount=-100, date="2023-10-10T12:30:00", category="Shopping") for i in range(3, 6)])
    
    results = detect_anomalies(txs)
    anomalous_ids = [r.id for r in results]
    assert "1" in anomalous_ids
    
    midnight_reasons = [r.reasons for r in results if r.id == "1"][0]
    assert "midnight_transaction" in midnight_reasons

def test_duplicate_detection():
    txs = [
        AnomalyTransaction(id="1", merchant="Store A", amount=-100, date="2023-10-10T10:00:00", category="Shopping"),
        AnomalyTransaction(id="2", merchant="Store A", amount=-100, date="2023-10-10T11:00:00", category="Shopping"),
        AnomalyTransaction(id="3", merchant="Store B", amount=-100, date="2023-10-10T10:00:00", category="Shopping"),
        AnomalyTransaction(id="4", merchant="Store B", amount=-200, date="2023-10-10T11:00:00", category="Shopping"),
        AnomalyTransaction(id="5", merchant="Store C", amount=-300, date="2023-10-10T10:00:00", category="Shopping")
    ]
    
    results = detect_anomalies(txs)
    anomalous_ids = [r.id for r in results]
    assert "2" in anomalous_ids
    
    dup_reasons = [r.reasons for r in results if r.id == "2"][0]
    assert "duplicate_transaction" in dup_reasons

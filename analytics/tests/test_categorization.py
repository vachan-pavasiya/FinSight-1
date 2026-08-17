from models.schemas import CategorizeTransaction
from services.categorizer import categorize_transactions
from datetime import date

def test_known_merchants():
    txs = [
        CategorizeTransaction(merchant="swiggy", amount=-500, date=date.today()),
        CategorizeTransaction(merchant="amazon", amount=-1500, date=date.today()),
        CategorizeTransaction(merchant="netflix", amount=-649, date=date.today()),
    ]
    result = categorize_transactions(txs)
    
    assert result[0].category == "Food"
    assert result[1].category == "Shopping"
    assert result[2].category == "Entertainment"

def test_fuzzy_match():
    txs = [
        CategorizeTransaction(merchant="Swigy", amount=-500, date=date.today()),
    ]
    result = categorize_transactions(txs)
    
    assert result[0].category == "Food"

def test_fallback():
    txs = [
        CategorizeTransaction(merchant="Unknown XYZ", amount=-500, date=date.today()),
    ]
    result = categorize_transactions(txs)
    
    assert result[0].category == "Uncategorized"

def test_batch_processing():
    txs = [CategorizeTransaction(merchant=f"Merchant {i}", amount=-100, date=date.today()) for i in range(100)]
    result = categorize_transactions(txs)
    assert len(result) == 100
    assert all(r.category == "Uncategorized" for r in result)

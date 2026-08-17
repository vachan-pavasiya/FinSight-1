from models.schemas import InsightTransaction, Budget
from services.insight_generator import generate_insights
from datetime import date, timedelta

def test_insights_generation():
    today = date.today()
    last_month = today.replace(day=1) - timedelta(days=1)
    
    txs = [
        InsightTransaction(merchant="Amazon", amount=-8500, date=today, category="Shopping"),
        InsightTransaction(merchant="Swiggy", amount=-1000, date=today, category="Food"),
        InsightTransaction(merchant="Salary", amount=30000, date=today, category="Income"),
        
        InsightTransaction(merchant="Swiggy", amount=-500, date=last_month, category="Food")
    ]
    
    budgets = [
        Budget(category="Shopping", amount=5000)
    ]
    
    insights = generate_insights(txs, budgets)
    
    types = [i.type for i in insights]
    
    assert "largest_transaction" in types
    assert "top_category" in types
    assert "spending_change" in types
    assert "savings_rate" in types
    assert "budget_status" in types
    
    spending_change = [i for i in insights if i.type == "spending_change"][0]
    assert spending_change.change == 100.0 # 500 to 1000 is 100% increase
    assert "100% more" in spending_change.message

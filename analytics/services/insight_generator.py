import pandas as pd
from models.schemas import InsightTransaction, Budget, Insight
from typing import List, Optional
from datetime import date, timedelta

def generate_insights(transactions: List[InsightTransaction], budgets: Optional[List[Budget]] = None) -> List[Insight]:
    if not transactions:
        return []
    
    df = pd.DataFrame([tx.model_dump() for tx in transactions])
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.to_period('M')
    
    insights = []
    
    # 1. Largest transaction
    expense_df = df[df['amount'] < 0].copy()
    expense_df['amount_abs'] = expense_df['amount'].abs()
    
    if not expense_df.empty:
        largest_tx = expense_df.loc[expense_df['amount_abs'].idxmax()]
        insights.append(Insight(
            type="largest_transaction",
            message=f"Your largest expense was ₹{largest_tx['amount_abs']:,.0f} at {largest_tx['merchant']}"
        ))
        
        # 2. Top category
        category_spending = expense_df.groupby('category')['amount_abs'].sum()
        total_spending = category_spending.sum()
        top_cat = category_spending.idxmax()
        top_cat_pct = (category_spending.max() / total_spending) * 100
        insights.append(Insight(
            type="top_category",
            message=f"{top_cat} is your top spending category at {top_cat_pct:.0f}% of total"
        ))
        
        # 3. Highest spending day
        expense_df['day_name'] = expense_df['date'].dt.day_name()
        day_spending = expense_df.groupby('day_name')['amount_abs'].sum()
        highest_day = day_spending.idxmax()
        highest_day_amt = day_spending.max()
        insights.append(Insight(
            type="highest_spending_day",
            message=f"Your highest spending day was {highest_day} with ₹{highest_day_amt:,.0f}"
        ))
        
        # 4. Spending change
        current_month = df['month'].max()
        last_month = current_month - 1
        
        curr_spending = expense_df[expense_df['month'] == current_month].groupby('category')['amount_abs'].sum()
        last_spending = expense_df[expense_df['month'] == last_month].groupby('category')['amount_abs'].sum()
        
        for cat in curr_spending.index:
            if cat in last_spending and last_spending[cat] > 0:
                curr_amt = curr_spending[cat]
                last_amt = last_spending[cat]
                change_pct = ((curr_amt - last_amt) / last_amt) * 100
                if abs(change_pct) > 10: # Only report if change > 10%
                    word = "more" if change_pct > 0 else "less"
                    insights.append(Insight(
                        type="spending_change",
                        message=f"You spent {abs(change_pct):.0f}% {word} on {cat} this month vs last month",
                        category=cat,
                        change=change_pct
                    ))
                    
    # 5. Savings rate
    current_month = df['month'].max()
    curr_df = df[df['month'] == current_month].copy()
    income = curr_df[curr_df['amount'] > 0]['amount'].sum()
    expenses = curr_df[curr_df['amount'] < 0]['amount'].abs().sum()
    
    if income > 0:
        savings = income - expenses
        savings_rate = (savings / income) * 100
        if savings_rate > 0:
            insights.append(Insight(
                type="savings_rate",
                message=f"You saved {savings_rate:.0f}% of your income this month"
            ))
            
    # 6. Budget status
    if budgets:
        curr_expense_df = expense_df[expense_df['month'] == current_month].copy() if not expense_df.empty else pd.DataFrame(columns=['category', 'amount_abs'])
        category_spending = curr_expense_df.groupby('category')['amount_abs'].sum() if not curr_expense_df.empty else pd.Series(dtype=float)
        
        for budget in budgets:
            spent = category_spending.get(budget.category, 0)
            if spent > budget.amount:
                excess = spent - budget.amount
                insights.append(Insight(
                    type="budget_status",
                    message=f"You've exceeded your {budget.category} budget by ₹{excess:,.0f}"
                ))

    return insights

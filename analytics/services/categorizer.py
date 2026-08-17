from rapidfuzz import fuzz, process
from models.schemas import CategorizeTransaction, CategorizedTransaction
from typing import List

MERCHANT_RULES = {
    # Food & Dining
    'swiggy': 'Food', 'zomato': 'Food', 'dominos': 'Food', 'mcdonalds': 'Food',
    'kfc': 'Food', 'subway': 'Food', 'burger king': 'Food', 'pizza hut': 'Food',
    'dunkin': 'Food', 'starbucks': 'Food', 'cafe': 'Food',
    # Transport
    'uber': 'Transport', 'ola': 'Transport', 'rapido': 'Transport',
    'irctc': 'Transport', 'makemytrip': 'Transport', 'redbus': 'Transport',
    'metro': 'Transport', 'petrol': 'Transport', 'fuel': 'Transport',
    # Shopping
    'amazon': 'Shopping', 'flipkart': 'Shopping', 'myntra': 'Shopping',
    'meesho': 'Shopping', 'nykaa': 'Shopping', 'ajio': 'Shopping',
    'reliance': 'Shopping', 'dmart': 'Shopping', 'bigbasket': 'Shopping',
    # Entertainment
    'netflix': 'Entertainment', 'prime': 'Entertainment', 'hotstar': 'Entertainment',
    'spotify': 'Entertainment', 'youtube': 'Entertainment', 'zee5': 'Entertainment',
    'sonyliv': 'Entertainment', 'pvr': 'Entertainment', 'inox': 'Entertainment',
    # Bills & Utilities
    'electricity': 'Bills', 'water': 'Bills', 'gas': 'Bills', 'broadband': 'Bills',
    'jio': 'Bills', 'airtel': 'Bills', 'vodafone': 'Bills', 'bsnl': 'Bills',
    'bescom': 'Bills', 'mseb': 'Bills', 'tata power': 'Bills',
    # Health
    'pharmacy': 'Health', 'hospital': 'Health', 'clinic': 'Health', 'apollo': 'Health',
    'medplus': 'Health', 'netmeds': 'Health', '1mg': 'Health', 'pharmeasy': 'Health',
    # Education
    'udemy': 'Education', 'coursera': 'Education', 'byju': 'Education',
    'unacademy': 'Education', 'school': 'Education', 'college': 'Education',
    # Travel
    'hotel': 'Travel', 'oyo': 'Travel', 'booking.com': 'Travel', 'airbnb': 'Travel',
    'goibibo': 'Travel', 'yatra': 'Travel', 'indigo': 'Travel', 'spicejet': 'Travel',
    # Income (credits)
    'salary': 'Income', 'interest': 'Income', 'dividend': 'Income',
    'refund': 'Income', 'cashback': 'Income', 'credit': 'Income',
    'neft': 'Income', 'imps': 'Income',
}

# Income-specific keywords (checked first regardless of amount)
INCOME_KEYWORDS = ['salary', 'interest', 'dividend', 'refund', 'cashback', 'credit', 'neft', 'imps']


def categorize_transactions(transactions: List[CategorizeTransaction]) -> List[CategorizedTransaction]:
    result = []
    merchants = list(MERCHANT_RULES.keys())

    for tx in transactions:
        merchant_lower = tx.merchant.lower().strip()
        amount = tx.amount

        # 1. Check income-specific keywords
        if any(kw in merchant_lower for kw in INCOME_KEYWORDS):
            result.append(CategorizedTransaction(**tx.model_dump(), category='Income', confidence=1.0))
            continue

        # 2. Direct exact rule match
        if merchant_lower in MERCHANT_RULES:
            result.append(CategorizedTransaction(**tx.model_dump(), category=MERCHANT_RULES[merchant_lower], confidence=1.0))
            continue

        # 3. Substring rule match (e.g. "amazon prime" contains "amazon")
        matched_rule = None
        for keyword, category in MERCHANT_RULES.items():
            if keyword in merchant_lower:
                matched_rule = category
                break
        if matched_rule:
            result.append(CategorizedTransaction(**tx.model_dump(), category=matched_rule, confidence=0.9))
            continue

        # 4. Fuzzy matching against known merchants
        match = process.extractOne(merchant_lower, merchants, scorer=fuzz.WRatio)
        if match and match[1] >= 80:
            best_merchant = match[0]
            result.append(CategorizedTransaction(**tx.model_dump(), category=MERCHANT_RULES[best_merchant], confidence=match[1] / 100.0))
            continue

        # 5. Fallback: positive amount → Income, negative → Uncategorized
        if amount > 0:
            result.append(CategorizedTransaction(**tx.model_dump(), category='Income', confidence=0.4))
        else:
            result.append(CategorizedTransaction(**tx.model_dump(), category='Uncategorized', confidence=0.0))

    return result

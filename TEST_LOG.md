# FinSight — Test Log

## Format
Each test entry follows: Test ID | Type | Feature | Description | Status | Notes

---

## Tests Planned

### Backend (Jest + Supertest)
| ID | Type | Feature | Test | Status |
|---|---|---|---|---|
| BE-001 | Unit | Auth | Signup with valid data | ⏳ |
| BE-002 | Unit | Auth | Duplicate email rejection | ⏳ |
| BE-003 | Unit | Auth | Login success | ⏳ |
| BE-004 | Unit | Auth | Login wrong password | ⏳ |
| BE-005 | Unit | Auth | Token refresh | ⏳ |
| BE-006 | Unit | Auth | Expired token rejection | ⏳ |
| BE-007 | Unit | Auth | Password reset end-to-end | ⏳ |
| BE-008 | Unit | Upload | Valid CSV upload | ⏳ |
| BE-009 | Unit | Upload | Valid XLSX upload | ⏳ |
| BE-010 | Unit | Upload | Corrupted file rejection | ⏳ |
| BE-011 | Unit | Upload | Oversized file rejection | ⏳ |
| BE-012 | Unit | Upload | Empty file rejection | ⏳ |
| BE-013 | Unit | Upload | Wrong MIME type rejection | ⏳ |
| BE-014 | Unit | Expenses | CRUD operations | ⏳ |
| BE-015 | Unit | Expenses | Filter by category | ⏳ |
| BE-016 | Unit | Expenses | Filter by date range | ⏳ |
| BE-017 | Unit | Budget | Create budget | ⏳ |
| BE-018 | Unit | Budget | Budget exceeded notification | ⏳ |
| BE-019 | Security | Auth | Rate limit enforcement | ⏳ |
| BE-020 | Security | Auth | Unauthorized route access | ⏳ |
| BE-021 | Security | SQL | SQLi payload in filter | ⏳ |

### Analytics (pytest)
| ID | Type | Feature | Test | Status |
|---|---|---|---|---|
| AN-001 | Unit | Categorization | Known merchants map correctly | ⏳ |
| AN-002 | Unit | Categorization | Fuzzy match for typos | ⏳ |
| AN-003 | Unit | Categorization | Unknown → Uncategorized | ⏳ |
| AN-004 | Unit | Anomalies | Outliers flagged | ⏳ |
| AN-005 | Unit | Anomalies | Normal transactions not flagged | ⏳ |
| AN-006 | Unit | Anomalies | Midnight transaction rule | ⏳ |
| AN-007 | Unit | Anomalies | Duplicate detection | ⏳ |
| AN-008 | Unit | Predictions | Linear trend prediction tolerance | ⏳ |
| AN-009 | Unit | Predictions | Minimal data handling | ⏳ |
| AN-010 | Unit | Insights | Spending change insight | ⏳ |
| AN-011 | Unit | Reports | PDF generated and non-empty | ⏳ |
| AN-012 | Unit | Reports | PDF contains section headers | ⏳ |

### E2E (Playwright)
| ID | Type | Feature | Test | Status |
|---|---|---|---|---|
| E2E-001 | E2E | Full Journey | Signup → verify → login | ⏳ |
| E2E-002 | E2E | Full Journey | Upload statement | ⏳ |
| E2E-003 | E2E | Full Journey | View categorized expenses | ⏳ |
| E2E-004 | E2E | Full Journey | Set budget | ⏳ |
| E2E-005 | E2E | Full Journey | View dashboard | ⏳ |
| E2E-006 | E2E | Full Journey | View insights | ⏳ |
| E2E-007 | E2E | Full Journey | Create goal | ⏳ |
| E2E-008 | E2E | Full Journey | Download report | ⏳ |
| E2E-009 | E2E | Responsive | Mobile layout (375px) | ⏳ |
| E2E-010 | E2E | Responsive | Tablet layout (768px) | ⏳ |
| E2E-011 | E2E | Responsive | Desktop layout (1440px) | ⏳ |

---

*Results will be filled in as tests are executed.*

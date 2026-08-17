# FinSight 💡 — Personal Finance & Expense Analytics Platform

> A production-grade, full-stack multi-service application for personal finance management, expense analytics, anomaly detection, and savings prediction.

[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docs.docker.com/compose/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-FastAPI-teal)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

---

## 🏗️ Architecture

```
React Frontend (Vite + Tailwind + Recharts) :3000
        │  REST (JWT Bearer)
        ▼
Node.js + Express Backend :4000  ──REST──▶  Python FastAPI Analytics :8000
        │
        ▼
PostgreSQL Database :5432
```

---

## 🚀 Quick Start (Docker Compose)

### Prerequisites
- [Docker Desktop](https://docs.docker.com/desktop/) installed and running
- No other dependencies needed!

### 1. Clone & configure

```bash
git clone <repo-url>
cd FinSight
```

Copy environment files:

```bash
cp backend/.env.example backend/.env
cp analytics/.env.example analytics/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and set:
- `JWT_SECRET` — a long random string
- `REFRESH_SECRET` — another long random string

### 2. Start all services

```bash
docker-compose up --build
```

This will:
1. Start PostgreSQL
2. Run database migrations automatically
3. Seed initial data (categories, admin user, test user)
4. Start the analytics service
5. Start the backend API
6. Start the frontend dev server

### 3. Access the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| API Docs (Swagger) | http://localhost:4000/api-docs |
| Analytics Service | http://localhost:8000 |
| Analytics Docs | http://localhost:8000/docs |

### 4. Default accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@finsight.com | Admin@123456 |
| Test User | test@finsight.com | Test@123456 |

---

## 🧪 Running Tests

### Backend tests (Jest + Supertest)
```bash
cd backend
npm test
```

### Analytics tests (pytest)
```bash
cd analytics
pip install -r requirements.txt
pytest tests/ -v
```

### Frontend tests (Vitest)
```bash
cd frontend
npm test
```

### End-to-End tests (Playwright)
```bash
# Ensure docker-compose is running first
cd frontend
npx playwright test
```

---

## 📁 Project Structure

```
FinSight/
├── docker-compose.yml          # Orchestrates all services
├── README.md
├── PROGRESS.md                 # Build log
├── TEST_LOG.md                 # Test results log
├── DEPLOY.md                   # Deployment guide
│
├── frontend/                   # React + Vite + Tailwind + Recharts
│   ├── Dockerfile
│   ├── src/
│   │   ├── pages/              # Route-level pages
│   │   ├── components/         # Reusable UI components
│   │   ├── api/                # Axios API client
│   │   ├── context/            # Auth + Theme contexts
│   │   └── hooks/              # Custom React hooks
│   └── .env.example
│
├── backend/                    # Node.js + Express + Prisma
│   ├── Dockerfile
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── controllers/        # Business logic
│   │   ├── services/           # Service layer
│   │   ├── middleware/         # Auth, validation, upload, error
│   │   └── config/             # Env, Prisma, Swagger
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema
│   │   └── seed.js             # Seed data
│   ├── tests/                  # Jest + Supertest
│   └── .env.example
│
└── analytics/                  # Python + FastAPI + ML
    ├── Dockerfile
    ├── requirements.txt
    ├── routers/                # FastAPI routes
    ├── services/               # ML & analytics logic
    ├── tests/                  # pytest
    └── .env.example
```

---

## 🌟 Features

| Feature | Status |
|---|---|
| JWT Auth + Refresh Tokens | ✅ |
| Email Verification | ✅ |
| CSV/XLSX Upload | ✅ |
| Automatic Categorization (rule-based + NLP) | ✅ |
| Interactive Dashboard (Recharts) | ✅ |
| Budget Planner | ✅ |
| Smart Insights (NL, Python) | ✅ |
| Anomaly Detection (Isolation Forest + Z-score + IQR) | ✅ |
| Savings Prediction (Linear Regression) | ✅ |
| Financial Goals | ✅ |
| PDF Reports | ✅ |
| Admin Panel | ✅ |
| Email Notifications | ✅ |
| Search & Filters | ✅ |
| Dark Mode | ✅ |
| Mobile Responsive | ✅ |
| OpenAPI Docs | ✅ |

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT access tokens (15 min) + httpOnly refresh tokens (7 days, rotated on use)
- Rate limiting: 10 req/15min on auth endpoints
- Helmet for HTTP security headers
- CORS locked to known origins
- Input validation with **Zod** on all endpoints
- File upload sanitization (type, size, malformed content)
- Parameterized queries via Prisma ORM (no SQL injection)

---

## 📖 API Reference

Full interactive docs at: **http://localhost:4000/api-docs**

Quick reference:

```
POST /auth/signup           Register new user
POST /auth/login            Login
POST /auth/refresh          Refresh access token
POST /auth/forgot-password  Request password reset
POST /auth/verify-email     Verify email address

GET  /profile               Get profile
PUT  /profile               Update profile

POST /upload                Upload CSV/XLSX statement
GET  /expenses              List expenses (with filters)
POST /expenses              Add expense
PUT  /expenses/:id          Update expense
DELETE /expenses/:id        Delete expense

GET  /budget                Get budgets
POST /budget                Set budget
DELETE /budget/:id          Delete budget

GET  /goals                 List goals
POST /goals                 Create goal
PUT  /goals/:id             Update goal

GET  /analytics             Monthly analytics summary
GET  /insights              Smart NL insights
GET  /predictions           Savings predictions
GET  /anomalies             Anomalous transactions

GET  /report                Generate + download PDF
GET  /report/list           List generated reports

GET  /notifications         List notifications
PUT  /notifications/:id/read  Mark as read

GET  /admin/users           Admin: list users
GET  /admin/stats           Admin: platform stats
```

---

## 🤝 Contributing

See [DEPLOY.md](./DEPLOY.md) for deployment instructions.

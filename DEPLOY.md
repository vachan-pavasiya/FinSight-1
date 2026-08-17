# FinSight — Deployment Guide

## Local Development (Recommended)

Use `docker-compose up --build` from the project root. See README.md for full instructions.

---

## Production Deployment

### Frontend → Vercel

1. Push your repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `frontend/`
4. Set environment variable:
   - `VITE_API_URL` → your backend URL (e.g. `https://api.finsight.yourapp.com`)
5. Build command: `npm run build`
6. Output directory: `dist`

### Backend + Database → Railway

1. Create a new Railway project
2. Add a **PostgreSQL** service (Railway managed)
3. Add a **Node.js** service pointing to `backend/`
4. Set environment variables:
   - `DATABASE_URL` → Railway PostgreSQL connection string
   - `JWT_SECRET` → strong random string
   - `REFRESH_SECRET` → strong random string
   - `ANALYTICS_URL` → URL of your analytics service
   - `FRONTEND_URL` → your Vercel frontend URL
   - `NODE_ENV` → `production`
5. Add a start command: `npm run start:prod`

### Analytics Service → Railway or Render

1. Add another service pointing to `analytics/`
2. Runtime: Python 3.11
3. Set environment variables:
   - `ALLOWED_ORIGINS` → your backend URL
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Render Alternative

Both backend and analytics can be deployed to [Render](https://render.com):
1. Create a new Web Service
2. Connect your GitHub repo
3. Set root directory (`backend/` or `analytics/`)
4. Set environment variables as above
5. Render auto-detects Node.js and Python runtimes

### AWS (EC2 + RDS) — Production Scale

For production-scale deployment:
1. Use **Amazon RDS PostgreSQL** for the database
2. Use **EC2** or **ECS (Fargate)** for backend + analytics services
3. Use **S3 + CloudFront** for frontend assets
4. Use **AWS ECR** to push Docker images
5. Use **Application Load Balancer** to route traffic

Docker commands for ECR push:
```bash
# Build
docker build -t finsight-backend ./backend
docker build -t finsight-analytics ./analytics

# Tag + push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag finsight-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/finsight-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/finsight-backend:latest
```

---

## Environment Variables Reference

### backend/.env
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/finsight` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `super-secret-jwt-key-32chars` |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `REFRESH_SECRET` | Refresh token signing secret | `super-secret-refresh-key` |
| `REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `ANALYTICS_URL` | Analytics service base URL | `http://analytics:8000` |
| `FRONTEND_URL` | Frontend URL (for CORS) | `http://localhost:3000` |
| `PORT` | Backend port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `UPLOAD_DIR` | File upload directory | `/app/uploads` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` |

### analytics/.env
| Variable | Description | Example |
|---|---|---|
| `HOST` | Service host | `0.0.0.0` |
| `PORT` | Service port | `8000` |
| `ALLOWED_ORIGINS` | Allowed CORS origins | `http://backend:4000` |

### frontend/.env
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://localhost:4000` |

---

## Database Migrations

Migrations are run automatically on startup via the backend entrypoint:
```bash
npx prisma migrate deploy
node prisma/seed.js
```

For manual migration in development:
```bash
cd backend
npx prisma migrate dev --name <migration-name>
```

To reset the database completely:
```bash
cd backend
npx prisma migrate reset
```

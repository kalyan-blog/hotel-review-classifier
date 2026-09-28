# Hotel Review Classifier (Full-Stack Vercel Monorepo)

A full-stack, machine-learning-powered web application for hotel review sentiment classification. Deployed as a **single unified Vercel deployment** with a **React + Vite** frontend, a **Python FastAPI serverless API (`api/index.py`)**, and a **persistent PostgreSQL database**.

---

## 1. Single-Domain Vercel Architecture

Both the React frontend and the Python serverless API are served from the **same Vercel domain**:

```text
Frontend
    ↓
Vercel API
    ↓
FastAPI
    ↓
ML Model
    ↓
PostgreSQL
```

### Request & Deployment Flow
```text
                               Single Vercel Domain
                       (https://your-project.vercel.app)
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
      Routes: / (and assets)                       Routes: /api/*
                ▼                                             ▼
  Frontend (React + Vite SPA)                   FastAPI Serverless Functions
       (frontend/dist)                                (api/index.py)
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            │                                   │
                                            ▼                                   ▼
                               ML Classifier Pipeline                 Persistent PostgreSQL
                             (TF-IDF + Logistic Regression)             (DATABASE_URL)
```

- **Frontend**: Built via `cd frontend && npm install && npm run build` and output to `frontend/dist`.
- **API**: Managed by Vercel's Python runtime via `api/index.py` and root `requirements.txt`.
- **Database**: Connects to a persistent managed PostgreSQL instance (e.g. Neon, Supabase, Railway, AWS RDS) via `DATABASE_URL`.
- **ML Model**: Scikit-Learn TF-IDF + Logistic Regression pipeline pre-trained on 1,000 hotel reviews and loaded once on serverless cold start.

---

## 2. Project Structure

```text
hotel-review-classifier/
├── api/
│   └── index.py             # FastAPI serverless entrypoint (exposes app = FastAPI())
├── backend/
│   ├── database.py          # Automated database, table creation, and connection handling
│   ├── app/
│   │   ├── config.py        # Environment variables & PostgreSQL URL parser
│   │   ├── database.py      # Database compatibility layer
│   │   ├── models.py        # ReviewClassification & HotelReview ORM models
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   ├── crud.py          # Database operations
│   │   ├── services/
│   │   │   ├── classifier.py# Scikit-learn inference service
│   │   │   └── statistics.py# Aggregate metrics calculator
│   │   └── ml/
│   │       ├── train_model.py # ML training script
│   │       ├── model.py     # Joblib model loader
│   │       └── models/
│   │           └── hotel_review_classifier.joblib
│   └── data/
│       ├── hotel_reviews.csv# 1,000 sample hotel review dataset
│       └── hotel_reviews.db # Automated local SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Cards, Charts, Tables, Pipeline Flow
│   │   ├── pages/           # Dashboard, Review Classifier, Dataset Insights
│   │   ├── services/
│   │   │   └── api.ts       # Centralized REST API client (uses relative /api)
│   │   ├── data/            # Static metadata & interfaces
│   │   ├── App.tsx          # Main React state router
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── .env                 # Local VITE_API_URL=http://localhost:8000/api
│   └── .env.example
├── requirements.txt         # Root Python dependencies for Vercel serverless
├── vercel.json              # Vercel single-project build and rewrite configuration
├── .env.example             # Root environment variables template
├── .gitignore               # Ignores .env, node_modules, venv, databases
└── README.md
```

---

## 3. REST API Endpoints

All endpoints are prefixed with `/api` and are accessible on the same domain:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health and readiness check (`{"status": "ok"}`) |
| `POST` | `/api/reviews/classify` | Classify sentiment (Positive/Negative) & persist to PostgreSQL |
| `GET` | `/api/reviews/recent` | Retrieve latest 10 classified reviews |
| `GET` | `/api/dashboard/stats` | Aggregated counts (`total`, `positive`, `negative`, `accuracy`) |
| `GET` | `/api/dashboard/sentiment-distribution` | Class distribution (`{"positive": 720, "negative": 280}`) |
| `GET` | `/api/dashboard/rating-distribution` | Rating distribution metadata |

### Sample POST `/api/reviews/classify`

**Request Body:**
```json
{
  "review": "The hotel was excellent and the staff were very friendly."
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "review": "The hotel was excellent and the staff were very friendly.",
  "sentiment": "Positive",
  "confidence": 88.4,
  "created_at": "2026-09-28T15:25:01.731812"
}
```

---

## 4. Step-by-Step Vercel Deployment Guide

Deploying this full-stack application to Vercel takes under 3 minutes:

### Step 1: Create a PostgreSQL Database
You need a persistent PostgreSQL database. Free managed options include:
- **Neon** (Recommended, serverless PostgreSQL): [neon.tech](https://neon.tech)
- **Supabase**: [supabase.com](https://supabase.com)
- **Railway**: [railway.app](https://railway.app)
- **AWS RDS** or **Render PostgreSQL**

Copy your PostgreSQL connection string:
```text
postgresql://username:password@ep-sample-pool.us-east-1.aws.neon.tech/hotel_reviews?sslmode=require
```

### Step 2: Push Repository to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Hotel Review Classifier full-stack Vercel app"
git branch -M main
git remote add origin https://github.com/kalyan-blog/hotel-review-classifier.git
git push -u origin main
```

### Step 3: Import Project into Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository.
4. Leave **Framework Preset** as **Other** (or **Vite**). `vercel.json` automatically dictates the build commands and routing.
5. In **Environment Variables**, add:
   - `DATABASE_URL`: Your persistent PostgreSQL connection string from Step 1.
   - `VITE_API_URL`: `/api`
   - `FRONTEND_URL`: `https://your-project.vercel.app` (or leave blank to permit current origin).
6. Click **Deploy**.

### Step 4: Verification on Vercel
Once deployed:
- Visit `https://your-project.vercel.app/` -> The hotel review classification dashboard loads with live stats.
- Visit `https://your-project.vercel.app/api/health` -> Returns `{"status": "ok"}`.
- Visit `https://your-project.vercel.app/api/docs` -> Interactive Swagger UI.
- Submit a review in the **Review Classifier** tab -> The prediction is computed by the Python ML model and stored in your PostgreSQL database!

---

## 5. Local Development Setup

To run both the frontend and backend locally:

### 1. Start the FastAPI Backend
```bash
# In project root:
backend\venv\Scripts\activate   # Windows
# or: source backend/venv/bin/activate (macOS/Linux)

# Run uvicorn on the api/index.py entry point:
uvicorn api.index:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (Docs: `http://localhost:8000/api/docs`).

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173` or `http://localhost:5174`.

---

## 6. Environment Variables Reference

| Variable | Description | Local Default | Production (Vercel) |
|---|---|---|---|
| `DATABASE_URL` | SQLAlchemy PostgreSQL connection string | `sqlite:///./hotel_reviews.db` | `postgresql://user:pass@host:5432/dbname` |
| `VITE_API_URL` | Base API path used by React frontend | `http://localhost:8000/api` | `/api` |
| `FRONTEND_URL` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://localhost:5174` | `https://your-project.vercel.app` |
| `MODEL_PATH` | Path to trained `.joblib` model artifact | Default to `backend/app/ml/models/...` | Same |

---

## 7. Security & Best Practices

- **Zero Credentials in Git**: `.env` and `*.db` are strictly ignored by `.gitignore`.
- **Persistence**: Production relies solely on PostgreSQL so classifications persist permanently across serverless cold starts and redeployments.
- **Single Cold-Start Optimization**: The ML pipeline is loaded once into memory on serverless initialization rather than reloaded on each incoming request.

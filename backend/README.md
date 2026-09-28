# Hotel Review Classifier - Backend API

FastAPI REST API powered by Scikit-Learn TF-IDF + Logistic Regression NLP classification and persistent SQLAlchemy database storage (SQLite for local development, PostgreSQL for production).

---

## Features

- **TF-IDF + Logistic Regression Pipeline**: Single joblib artifact for text vectorization and probability estimation.
- **RESTful Endpoints**:
  - `GET /api/health` - API health and readiness check
  - `POST /api/reviews/classify` - Predict sentiment and persist to database
  - `GET /api/reviews/recent` - Fetch 10 most recent classifications
  - `GET /api/dashboard/stats` - Live review counts and accuracy metrics
  - `GET /api/dashboard/sentiment-distribution` - Positive vs Negative dataset distribution
  - `GET /api/dashboard/rating-distribution` - Rating metadata handler
- **Persistent Database**: Automatically initializes tables without wiping historical user classifications across server restarts or redeployments.
- **Swagger Documentation**: Interactive documentation available at `/docs`.

---

## Local Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows**:
  ```bash
  venv\Scripts\activate
  ```
- **macOS/Linux**:
  ```bash
  source venv/bin/activate
  ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Train or Retrain ML Model (Optional)
```bash
python -m app.ml.train_model
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` and Swagger docs at `http://localhost:8000/docs`.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./hotel_reviews.db` |
| `FRONTEND_URL` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://localhost:5174` |
| `MODEL_PATH` | Path to trained `.joblib` model | `app/ml/models/hotel_review_classifier.joblib` |

---

## Deployment (Render)

1. **Build Command**: `pip install -r requirements.txt && python -m app.ml.train_model`
2. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Environment Variables**:
   - `DATABASE_URL`: Your persistent PostgreSQL connection string (e.g. `postgresql://...`)
   - `FRONTEND_URL`: Your production frontend URL (e.g. `https://your-app.vercel.app`)

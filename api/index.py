import os
import sys

# Ensure root directory and backend directory are in sys.path for serverless execution
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import (
    get_db,
    init_database,
    insert_classification,
    get_recent_classifications,
    get_dashboard_statistics,
    get_sentiment_distribution as db_sentiment_distribution,
    DATABASE_URL,
)
from app.config import FRONTEND_URL
from app.schemas import (
    HealthResponse,
    ReviewClassifyRequest,
    ReviewClassifyResponse,
    RecentReviewResponse,
    DashboardStatsResponse,
    SentimentDistributionResponse,
    RatingDistributionResponse,
)
from app.services.classifier import load_model, classify_review
from app.services.statistics import get_rating_distribution

# Automatically initialize database schema and load ML pipeline ONCE during module cold start
try:
    init_database()
    load_model()
except Exception as e:
    print(f"Warning during serverless initialization: {e}")

app = FastAPI(
    title="Hotel Review Classifier API",
    description="Vercel Serverless FastAPI Backend for Hotel Review Sentiment Classification",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# CORS configuration
origins = [url.strip() for url in FRONTEND_URL.split(",") if url.strip()]
origins.extend(["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------------------------
# 1. Health Endpoint
# ----------------------------------------------------
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
@app.get("/health", response_model=HealthResponse, include_in_schema=False)
def check_health():
    return {"status": "ok"}


# ----------------------------------------------------
# 2. Review Classification Endpoint
# ----------------------------------------------------
@app.post(
    "/api/reviews/classify",
    response_model=ReviewClassifyResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Reviews"],
    summary="Classify Hotel Review",
    description="Predict sentiment with confidence score using TF-IDF + Logistic Regression, and persist record through database.py.",
)
@app.post("/reviews/classify", response_model=ReviewClassifyResponse, include_in_schema=False)
def classify_and_save_review(
    payload: ReviewClassifyRequest,
    db: Session = Depends(get_db),
):
    review_text = payload.review.strip()
    if not review_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review text cannot be empty.",
        )

    try:
        # 1. Run ML model inference
        result = classify_review(review_text)

        # 2. Save classification record through database.py
        saved_record = insert_classification(
            review_text=review_text,
            sentiment=result["sentiment"],
            confidence=result["confidence"],
            db=db,
        )

        return {
            "id": saved_record.id,
            "review": saved_record.review_text,
            "sentiment": saved_record.sentiment,
            "confidence": saved_record.confidence,
            "created_at": saved_record.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while evaluating the review. Please try again.",
        )


# ----------------------------------------------------
# 3. Recent Classifications Endpoint
# ----------------------------------------------------
@app.get(
    "/api/reviews/recent",
    response_model=List[RecentReviewResponse],
    tags=["Reviews"],
    summary="Get Recent Review Classifications",
    description="Fetch the 10 most recently classified customer hotel reviews via database.py.",
)
@app.get("/reviews/recent", response_model=List[RecentReviewResponse], include_in_schema=False)
def get_recent_reviews(
    db: Session = Depends(get_db),
):
    try:
        records = get_recent_classifications(limit=10, db=db)
        return [
            {
                "id": r.id,
                "review": r.review_text,
                "sentiment": r.sentiment,
                "confidence": r.confidence,
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve recent classifications.",
        )


# ----------------------------------------------------
# 4. Dashboard Stats Endpoint
# ----------------------------------------------------
@app.get(
    "/api/dashboard/stats",
    response_model=DashboardStatsResponse,
    tags=["Dashboard"],
    summary="Get Dashboard Statistics",
    description="Retrieve live aggregate review counts (total, positive, negative) and ML model accuracy via database.py.",
)
@app.get("/dashboard/stats", response_model=DashboardStatsResponse, include_in_schema=False)
def fetch_stats(db: Session = Depends(get_db)):
    try:
        return get_dashboard_statistics(db=db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load dashboard statistics.",
        )


# ----------------------------------------------------
# 5. Sentiment Distribution Endpoint
# ----------------------------------------------------
@app.get(
    "/api/dashboard/sentiment-distribution",
    response_model=SentimentDistributionResponse,
    tags=["Dashboard"],
    summary="Get Sentiment Distribution",
    description="Retrieve proportional breakdown of positive and negative sentiment samples via database.py.",
)
@app.get("/dashboard/sentiment-distribution", response_model=SentimentDistributionResponse, include_in_schema=False)
def fetch_sentiment_distribution(db: Session = Depends(get_db)):
    try:
        return db_sentiment_distribution(db=db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load sentiment distribution.",
        )


# ----------------------------------------------------
# 6. Rating Distribution Endpoint
# ----------------------------------------------------
@app.get(
    "/api/dashboard/rating-distribution",
    response_model=RatingDistributionResponse,
    tags=["Dashboard"],
    summary="Get Rating Distribution",
    description="Retrieve rating distribution or empty status if dataset is binary classification without star ratings.",
)
@app.get("/dashboard/rating-distribution", response_model=RatingDistributionResponse, include_in_schema=False)
def fetch_rating_distribution():
    return get_rating_distribution()


@app.get("/api", tags=["Root"])
def root_api():
    return {
        "message": "Hotel Review Classifier API on Vercel Serverless",
        "docs": "/api/docs",
        "health": "/api/health",
    }

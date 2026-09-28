from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    DashboardStatsResponse,
    SentimentDistributionResponse,
    RatingDistributionResponse,
)
from app.services.statistics import (
    get_dashboard_stats,
    get_sentiment_distribution,
    get_rating_distribution,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    summary="Get Dashboard Statistics",
    description="Retrieve live aggregate review counts (total, positive, negative) and ML model accuracy.",
)
def fetch_stats(db: Session = Depends(get_db)):
    try:
        return get_dashboard_stats(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load dashboard statistics.",
        )


@router.get(
    "/sentiment-distribution",
    response_model=SentimentDistributionResponse,
    summary="Get Sentiment Distribution",
    description="Retrieve proportional breakdown of positive and negative sentiment samples.",
)
def fetch_sentiment_distribution(db: Session = Depends(get_db)):
    try:
        return get_sentiment_distribution(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load sentiment distribution.",
        )


@router.get(
    "/rating-distribution",
    response_model=RatingDistributionResponse,
    summary="Get Rating Distribution",
    description="Retrieve rating distribution or empty status if dataset is binary classification without star ratings.",
)
def fetch_rating_distribution():
    return get_rating_distribution()

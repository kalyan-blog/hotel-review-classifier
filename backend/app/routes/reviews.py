from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ReviewClassifyRequest, ReviewClassifyResponse, RecentReviewResponse
from app.services.classifier import classify_review
from app.services.aspect_analyzer import analyze_hotel_review_aspects
from app.crud import create_classification, get_recent_classifications

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post(
    "/classify",
    response_model=ReviewClassifyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Classify Hotel Review",
    description="Predict sentiment with confidence score using TF-IDF + Logistic Regression, perform aspect-based analysis, and persist record to database.",
)
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
        # Run ML model inference
        result = classify_review(review_text)

        # Run aspect-based analysis
        aspect_data = analyze_hotel_review_aspects(review_text, result["sentiment"])

        # Persist classification record to database
        saved_record = create_classification(
            db=db,
            review_text=review_text,
            sentiment=result["sentiment"],
            confidence=result["confidence"],
            aspects_data=aspect_data,
        )

        return {
            "id": saved_record.id,
            "review": saved_record.review_text,
            "sentiment": saved_record.sentiment,
            "confidence": saved_record.confidence,
            "summary": aspect_data.get("summary"),
            "aspects": aspect_data.get("aspects", []),
            "positive_aspects": aspect_data.get("positive_aspects", []),
            "negative_aspects": aspect_data.get("negative_aspects", []),
            "neutral_aspects": aspect_data.get("neutral_aspects", []),
            "positive_feedback": aspect_data.get("positive_feedback", []),
            "negative_feedback": aspect_data.get("negative_feedback", []),
            "management_insight": aspect_data.get("management_insight"),
            "created_at": saved_record.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while evaluating the review. Please try again.",
        )


@router.get(
    "/recent",
    response_model=List[RecentReviewResponse],
    summary="Get Recent Review Classifications",
    description="Fetch the 10 most recently classified customer hotel reviews.",
)
def get_recent_reviews(
    db: Session = Depends(get_db),
):
    try:
        records = get_recent_classifications(db=db, limit=10)
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

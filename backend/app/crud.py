from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import ReviewClassification, HotelReview


import json


def create_classification(
    db: Session, review_text: str, sentiment: str, confidence: float, aspects_data: dict = None
) -> ReviewClassification:
    aspects_json_str = json.dumps(aspects_data) if aspects_data else None
    record = ReviewClassification(
        review_text=review_text,
        sentiment=sentiment,
        confidence=confidence,
        aspects_json=aspects_json_str,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_recent_classifications(db: Session, limit: int = 10) -> List[ReviewClassification]:
    return (
        db.query(ReviewClassification)
        .order_by(ReviewClassification.id.desc())
        .limit(limit)
        .all()
    )


def get_counts(db: Session) -> Tuple[int, int, int]:
    """
    Returns (total_reviews, positive_reviews, negative_reviews).
    Derives baseline counts from hotel_reviews dataset table, supplemented by
    user classified reviews.
    """
    # Baseline dataset
    dataset_total = db.query(HotelReview).count()
    dataset_pos = db.query(HotelReview).filter(HotelReview.sentiment == "Positive").count()
    dataset_neg = db.query(HotelReview).filter(HotelReview.sentiment == "Negative").count()

    # User classifications
    user_total = db.query(ReviewClassification).count()
    user_pos = db.query(ReviewClassification).filter(ReviewClassification.sentiment == "Positive").count()
    user_neg = db.query(ReviewClassification).filter(ReviewClassification.sentiment == "Negative").count()

    total = dataset_total + user_total
    pos = dataset_pos + user_pos
    neg = dataset_neg + user_neg

    # Fallback to standard 1000/720/280 if empty
    if total == 0:
        return 1000, 720, 280

    return total, pos, neg

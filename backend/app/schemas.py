from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"


class ReviewClassifyRequest(BaseModel):
    review: str = Field(
        ...,
        min_length=1,
        description="The customer review text to classify",
        example="The hotel was excellent and the staff were very friendly.",
    )


class ReviewClassifyResponse(BaseModel):
    id: int
    review: str
    sentiment: str
    confidence: float
    created_at: str

    class Config:
        from_attributes = True


class RecentReviewResponse(BaseModel):
    id: int
    review: str
    sentiment: str
    confidence: float
    created_at: str

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    total_reviews: int
    positive_reviews: int
    negative_reviews: int
    model_accuracy: float


class SentimentDistributionResponse(BaseModel):
    positive: int
    negative: int


class RatingItem(BaseModel):
    rating: str
    count: int


class RatingDistributionResponse(BaseModel):
    available: bool
    ratings: List[RatingItem]
    message: Optional[str] = None

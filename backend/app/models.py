from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ReviewClassification(Base):
    __tablename__ = "review_classifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    review_text = Column(Text, nullable=False)
    sentiment = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    aspects_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class HotelReview(Base):
    __tablename__ = "hotel_reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    review = Column(Text, nullable=False)
    sentiment = Column(String(50), nullable=False)

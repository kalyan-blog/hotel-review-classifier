"""
backend/app/database.py

Re-exports database engine, session, and initialization functions
from backend/database.py for unified architecture.
"""
import sys
import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import (
    DATABASE_URL,
    DEFAULT_SQLITE_PATH,
    engine,
    SessionLocal,
    Base,
    ReviewClassification,
    HotelReview,
    get_db,
    get_db_session,
    init_database,
    insert_classification,
    get_recent_classifications,
    get_dashboard_statistics,
    get_sentiment_distribution,
)

# Alias init_db for backward compatibility
init_db = init_database

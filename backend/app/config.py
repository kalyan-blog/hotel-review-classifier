import os
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "hotel_reviews.csv")
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "hotel_review_classifier.joblib")

IS_VERCEL = os.getenv("VERCEL") == "1" or os.getenv("ENV") == "production"


def get_database_url() -> str:
    raw_url = os.getenv("DATABASE_URL")
    
    if not raw_url:
        if IS_VERCEL:
            # Informative message for Vercel production
            print("WARNING: DATABASE_URL not set in production. Please set DATABASE_URL to a persistent PostgreSQL connection string in Vercel.")
            # Fallback to local sqlite or memory if unconfigured during build phase
            return "sqlite:///./hotel_reviews.db"
        return "sqlite:///./hotel_reviews.db"

    # Normalize PostgreSQL URL for SQLAlchemy 2.0+
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)
        
    return raw_url


DATABASE_URL = get_database_url()

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173,http://localhost:5174,http://localhost:3000"
)

MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)

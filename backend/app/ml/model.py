"""
Machine Learning model definitions and loader utilities for the Hotel Review Classifier.
"""
import os
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "models", "hotel_review_classifier.joblib"
)


def get_model_path() -> str:
    return os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)


def load_classifier_pipeline():
    path = get_model_path()
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Classifier model artifact not found at {path}. "
            f"Please run backend/app/ml/train_model.py first."
        )
    return joblib.load(path)

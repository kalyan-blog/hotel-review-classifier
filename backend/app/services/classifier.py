import os
from typing import Dict, Any, Optional
import numpy as np
from app.ml.model import load_classifier_pipeline

_pipeline = None


def load_model():
    """
    Loads or reuses the singleton scikit-learn TF-IDF + LogisticRegression pipeline.
    """
    global _pipeline
    if _pipeline is None:
        _pipeline = load_classifier_pipeline()
    return _pipeline


def classify_review(review_text: str) -> Dict[str, Any]:
    """
    Classifies a customer hotel review into Positive or Negative sentiment
    and calculates an calibrated probability confidence score between 0 and 100.
    """
    clean_text = review_text.strip() if review_text else ""
    if not clean_text:
        return {
            "sentiment": "Positive",
            "confidence": 50.0,
        }

    pipeline = load_model()

    # Probability estimation from Logistic Regression via predict_proba
    probabilities = pipeline.predict_proba([clean_text])[0]
    classes = pipeline.classes_

    # Find winning class
    pred_idx = np.argmax(probabilities)
    pred_class = str(classes[pred_idx]).capitalize()
    confidence_score = float(probabilities[pred_idx]) * 100.0

    # Ensure confidence is formatted within [0.0, 100.0] with 1 decimal place
    confidence = round(min(99.9, max(50.0, confidence_score)), 1)

    return {
        "sentiment": pred_class,
        "confidence": confidence,
    }

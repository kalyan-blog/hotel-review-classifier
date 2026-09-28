import os
import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "data", "hotel_reviews.csv")
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
MODEL_OUTPUT_PATH = os.path.join(MODELS_DIR, "hotel_review_classifier.joblib")


def train():
    print(f"Loading dataset from: {DATA_PATH}")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset file not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    # Validate required columns
    required_columns = {"review", "sentiment"}
    if not required_columns.issubset(df.columns):
        raise ValueError(
            f"Dataset missing required columns. Expected {required_columns}, found {set(df.columns)}"
        )

    # Clean missing values
    df = df.dropna(subset=["review", "sentiment"])
    df["review"] = df["review"].astype(str)
    df["sentiment"] = df["sentiment"].astype(str).str.strip().str.capitalize()

    print(f"Total samples: {len(df)}")
    print(f"Sentiment class breakdown:\n{df['sentiment'].value_counts()}")

    X = df["review"]
    y = df["sentiment"]

    # Stratified 80/20 train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Construct single scikit-learn Pipeline
    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=5000,
                sublinear_tf=True,
                stop_words="english",
            ),
        ),
        (
            "clf",
            LogisticRegression(
                C=1.0,
                max_iter=1000,
                random_state=42,
                class_weight="balanced",
            ),
        ),
    ])

    print("Training TF-IDF + Logistic Regression model...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred) * 100

    print("\n" + "=" * 50)
    print("MODEL EVALUATION RESULTS")
    print("=" * 50)
    print(f"Test Accuracy: {accuracy:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("=" * 50 + "\n")

    # Ensure models directory exists
    os.makedirs(MODELS_DIR, exist_ok=True)

    # Save model pipeline
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    print(f"Model saved successfully to: {MODEL_OUTPUT_PATH}")

    return pipeline, accuracy


if __name__ == "__main__":
    train()

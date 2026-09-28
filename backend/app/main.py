from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL
from app.database import init_db
from app.services.classifier import load_model
from app.routes import health, reviews, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database schema and seed dataset if empty
    print("Initializing database...")
    init_db()

    # Warm up ML pipeline
    print("Loading ML classifier pipeline...")
    load_model()
    print("Hotel Review Classifier API is ready.")

    yield

    # Shutdown
    print("Shutting down API...")


app = FastAPI(
    title="Hotel Review Classifier API",
    description="Production-ready REST API for Hotel Review Sentiment Classification using Natural Language Processing and Scikit-Learn.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
origins = [url.strip() for url in FRONTEND_URL.split(",") if url.strip()]
if not origins:
    origins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router)
app.include_router(reviews.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Hotel Review Classifier API is running",
        "docs": "/docs",
        "health": "/api/health",
    }

from fastapi import APIRouter
from app.schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check the health and readiness of the FastAPI classification server.",
)
def check_health():
    return {"status": "ok"}

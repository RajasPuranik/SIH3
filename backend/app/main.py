"""
PackSmart AI — FastAPI Application Entry Point

Brings up the backend with all routes, middleware, and startup initialization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, commodities, materials, recommend, trace, assistant, model_info

logger = logging.getLogger("packsmart")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    logger.info("PackSmart AI starting up...")
    init_db()
    logger.info("Database initialized")

    # Pre-load the recommendation engine
    try:
        recommender = recommend.get_recommender()
        logger.info(
            f"Recommendation engine loaded: "
            f"{len(recommender.materials)} materials, "
            f"{len(recommender.commodities)} commodities"
        )
    except Exception as e:
        logger.warning(f"Could not pre-load engine (will load on first request): {e}")

    yield

    # Shutdown
    logger.info("PackSmart AI shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "PackSmart AI — Intelligent food packaging recommendation system. "
        "Recommends optimal packaging materials based on food properties, "
        "storage conditions, and user priorities using a combination of "
        "expert rules, ML models, and multi-criteria scoring."
    ),
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(commodities.router)
app.include_router(materials.router)
app.include_router(recommend.router)
app.include_router(trace.router)
app.include_router(assistant.router)
app.include_router(model_info.router)


@app.get("/api/health", tags=["system"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

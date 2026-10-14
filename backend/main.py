from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import (
    APP_TITLE,
    APP_DESCRIPTION,
    VERSION,
    CORS_ORIGINS,
    DEFAULT_CENTER_LAT,
    DEFAULT_CENTER_LNG,
    DEFAULT_CITY
)
from services.db_service import db
from routers.reports import router as reports_router
from routers.incidents import router as incidents_router
from routers.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Populate in-memory database with realistic demo incidents
    db.seed_data()
    print(f"[{APP_TITLE}] Pre-loaded {len(db.incidents)} demo incidents and {len(db.reports)} reports.")
    yield
    # Shutdown clean up (if needed)


app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(reports_router, prefix="/api", tags=["Reports"])
app.include_router(incidents_router, prefix="/api", tags=["Incidents"])
app.include_router(dashboard_router, prefix="/api", tags=["Dashboard"])


@app.get("/", tags=["General"])
async def root():
    """
    Root endpoint returning system metadata and status.
    """
    return {
        "app": APP_TITLE,
        "description": APP_DESCRIPTION,
        "version": VERSION,
        "status": "online",
        "region": {
            "city": DEFAULT_CITY,
            "center": {
                "latitude": DEFAULT_CENTER_LAT,
                "longitude": DEFAULT_CENTER_LNG
            }
        },
        "endpoints": {
            "docs": "/docs",
            "incidents": "/api/incidents",
            "reports": "/api/reports",
            "dashboard_stats": "/api/dashboard/stats",
            "health": "/api/health"
        }
    }


@app.get("/api/health", tags=["General"])
async def health_check():
    """
    Health check endpoint returning database counts.
    """
    return {
        "status": "healthy",
        "version": VERSION,
        "database": {
            "incidents_count": len(db.incidents),
            "reports_count": len(db.reports)
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

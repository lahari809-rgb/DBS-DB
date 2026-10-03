import os
import time
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import recognition, users, signs, translations, history, analytics, architecture, auth, vocabulary, practice
from app.db.database import db_manager
from app.time_utils import get_ist_iso, format_ist

app = FastAPI(
    title="Continuous Indian Sign Language (ISL) Translator AI",
    version=settings.VERSION,
    description="Continuous Indian Sign Language (ISL) AI Recognition & Grammar Translation Pipeline (MediaPipe, Temporal Sequence AI, FastAPI, MongoDB) — Indian Standard Time (IST)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Telemetry Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Register API Routers
app.include_router(recognition.router, prefix=settings.API_PREFIX)
app.include_router(vocabulary.router, prefix=settings.API_PREFIX)
app.include_router(practice.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(signs.router, prefix=settings.API_PREFIX)
app.include_router(translations.router, prefix=settings.API_PREFIX)
app.include_router(history.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(architecture.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)

# Static and React Production Assets
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")
STATIC_DIR = os.path.join(BASE_DIR, "static")

if os.path.exists(os.path.join(FRONTEND_DIST, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="dist_assets")

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/health", tags=["Health & Status"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "MongoDB" if db_manager.is_mongo_connected else "Document DB Engine",
        "mongo_connected": db_manager.is_mongo_connected,
        "timezone": "IST (Indian Standard Time, UTC+05:30)",
        "currentTimeIST": format_ist(),
        "timestamp": get_ist_iso()
    }

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
        return JSONResponse({"detail": "Not Found"}, status_code=404)
        
    dist_index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(dist_index):
        return FileResponse(dist_index)
        
    legacy_index = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(legacy_index):
        return FileResponse(legacy_index)
        
    return JSONResponse({"status": "Frontend build ready", "docs": "/docs"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import (
    auth,
    customers,
    payments,
    products,
    reports,
    sessions,
    settings as settings_router,
    stations,
)
from .config import get_settings
from .database import Base, engine

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    auth.router,
    stations.router,
    customers.router,
    sessions.router,
    payments.router,
    products.router,
    reports.router,
    settings_router.router,
):
    app.include_router(router, prefix=settings.api_prefix)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}

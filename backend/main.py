import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth_routes, student_routes, organization_routes, verification_routes, general_routes, public_routes

logger = logging.getLogger(__name__)

# Create tables only if the database is reachable; otherwise keep the API available.
try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:
    logger.warning("Database initialization skipped: %s", exc)

app = FastAPI(title="Smart Career Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(student_routes.router)
app.include_router(organization_routes.router)
app.include_router(verification_routes.router)
app.include_router(general_routes.router)
app.include_router(public_routes.router)

print("Loaded routes:")
for route in app.routes:
    if hasattr(route, "path"):
        print(route.path)


@app.get("/")
def root():
    return {"message": "SCMS backend is running"}
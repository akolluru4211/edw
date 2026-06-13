from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, profile, resume, ai_coach, opportunities, network, community, admin

app = FastAPI(title="Edworld AI Mentor API", version="0.1.0")

# Allow frontend (http://localhost:3001) to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(ai_coach.router, prefix="/api/ai-coach", tags=["ai-coach"])
app.include_router(opportunities.router, prefix="/api/opportunities", tags=["opportunities"])
app.include_router(network.router, prefix="/api/network", tags=["network"])
app.include_router(community.router, prefix="/api/community", tags=["community"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

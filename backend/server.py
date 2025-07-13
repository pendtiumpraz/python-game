from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import uvicorn
import asyncio
from datetime import datetime

# Import our modules
from database import (
    init_db, create_user, get_user_by_uid, get_user_progress, 
    update_user_progress, get_all_quests, get_quest_by_id,
    save_code_execution, get_leaderboard
)
from code_executor import code_executor
from ai_hints import ai_hint_generator

app = FastAPI(title="CodeQuest API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/codequest")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Security
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    uid: str
    email: str
    username: str

class UserLogin(BaseModel):
    email: str
    password: str

class CodeExecutionRequest(BaseModel):
    code: str
    quest_id: str

class HintRequest(BaseModel):
    quest_id: str
    code: str
    user_progress: Optional[Dict] = None

class ProgressUpdate(BaseModel):
    level: int
    xp: int
    completed_quests: List[str]
    current_quest: Optional[str] = None
    achievements: List[str] = []

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token"""
    try:
        # For now, we'll use a simple approach
        # In production, you would verify the Firebase token here
        token = credentials.credentials
        
        # Mock user verification - replace with actual Firebase token verification
        if token == "guest-token":
            return {"uid": "guest", "email": "guest@codequest.com", "username": "Guest"}
        
        # For registered users, you would verify the Firebase token
        # and extract user information
        return {"uid": "user123", "email": "user@example.com", "username": "User"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()

# Basic routes
@app.get("/")
async def root():
    return {"message": "Welcome to CodeQuest API!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "CodeQuest Backend"}

# Authentication routes
@app.post("/api/auth/register")
async def register(user: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await get_user_by_uid(user.uid)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user
        new_user = await create_user(user.uid, user.email, user.username)
        
        return {
            "message": "User created successfully",
            "user": {
                "id": new_user["id"],
                "uid": new_user["uid"],
                "email": new_user["email"],
                "username": new_user["username"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
async def login(user: UserLogin):
    """Login user (handled by Firebase on frontend)"""
    return {"message": "Login handled by Firebase on frontend"}

@app.post("/api/auth/guest")
async def guest_login():
    """Create guest session"""
    return {
        "message": "Guest session created",
        "token": "guest-token"
    }

# Quest routes
@app.get("/api/quests")
async def get_quests():
    """Get all quests"""
    try:
        quests = await get_all_quests()
        return quests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quests/{quest_id}")
async def get_quest(quest_id: str):
    """Get a specific quest"""
    try:
        quest = await get_quest_by_id(quest_id)
        if not quest:
            raise HTTPException(status_code=404, detail="Quest not found")
        return quest
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Code execution routes
@app.post("/api/code/execute")
async def execute_code(
    request: CodeExecutionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Execute user code"""
    try:
        # Execute the code
        result = code_executor.execute_code(request.code, request.quest_id)
        
        # Save execution result
        if current_user["uid"] != "guest":
            await save_code_execution(
                user_id=current_user["uid"],
                quest_id=request.quest_id,
                code=request.code,
                output=result["output"],
                success=result["success"],
                execution_time=result["execution_time"],
                test_results=result["test_results"]
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/code/hint")
async def get_code_hint(
    request: HintRequest,
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered hint"""
    try:
        # Prepare user progress
        user_progress = request.user_progress or {
            "user_id": current_user["uid"],
            "level": 1,
            "xp": 0,
            "completed_quests": []
        }
        
        # Generate hint
        hint = await ai_hint_generator.generate_hint(
            quest_id=request.quest_id,
            user_code=request.code,
            user_progress=user_progress
        )
        
        return {"hint": hint}
        
    except Exception as e:
        print(f"Error in hint generation: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate hint")

# User progress routes
@app.get("/api/user/progress")
async def get_user_progress_route(current_user: dict = Depends(get_current_user)):
    """Get user progress"""
    try:
        if current_user["uid"] == "guest":
            return {
                "level": 1,
                "xp": 0,
                "completed_quests": [],
                "current_quest": None,
                "achievements": []
            }
        
        user = await get_user_by_uid(current_user["uid"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        progress = await get_user_progress(user["id"])
        if not progress:
            raise HTTPException(status_code=404, detail="User progress not found")
        
        return {
            "level": progress["level"],
            "xp": progress["xp"],
            "completed_quests": progress["completed_quests"],
            "current_quest": progress["current_quest"],
            "achievements": progress["achievements"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/progress")
async def update_user_progress_route(
    progress: ProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user progress"""
    try:
        if current_user["uid"] == "guest":
            return {"message": "Guest progress updated locally"}
        
        user = await get_user_by_uid(current_user["uid"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        await update_user_progress(user["id"], {
            "level": progress.level,
            "xp": progress.xp,
            "completed_quests": progress.completed_quests,
            "current_quest": progress.current_quest,
            "achievements": progress.achievements,
            "last_activity": datetime.utcnow()
        })
        
        return {"message": "Progress updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Leaderboard routes
@app.get("/api/leaderboard")
async def get_leaderboard_route(
    timeFilter: str = "all-time",
    categoryFilter: str = "all"
):
    """Get leaderboard"""
    try:
        leaderboard = await get_leaderboard(timeFilter, categoryFilter)
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional utility routes
@app.get("/api/concepts/{concept}")
async def get_concept_explanation(concept: str):
    """Get explanation for a Python concept"""
    try:
        explanation = await ai_hint_generator.generate_explanation("", concept)
        return {"concept": concept, "explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
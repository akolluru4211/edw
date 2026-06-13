import os
import uuid
import json
import shutil
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models import (
    User, Profile, Project, Experience, Certification, Skill,
    PointTransaction, Connection, Application, Resume
)
from app.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "avatars")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class UpdateProfileSchema(BaseModel):
    fullName: Optional[str] = None
    headline: Optional[str] = None
    collegeName: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduationYear: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None
    portfolioUrl: Optional[str] = None
    interests: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    dob: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProjectSchema(BaseModel):
    title: str
    description: str
    technologies: List[str]
    projectUrl: Optional[str] = None
    githubUrl: Optional[str] = None

class SkillSchema(BaseModel):
    name: str

class CertificationSchema(BaseModel):
    name: str
    issuer: str
    issueDate: str
    expiryDate: Optional[str] = None
    credentialId: Optional[str] = None

class ExperienceSchema(BaseModel):
    company: str
    role: str
    startDate: str
    endDate: Optional[str] = None
    description: str

def calculate_readiness_score(user_id: str, session: Session) -> int:
    score = 20  # Base score for registration
    
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        return 0
        
    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    if not profile:
        return 0

    resumes = session.exec(select(Resume).where(Resume.userId == user_id)).all()
    if resumes:
        score += 15

    if profile.bio and profile.collegeName and profile.degree:
        score += 15

    skills = session.exec(select(Skill).where(Skill.profileId == profile.id)).all()
    score += min(15, len(skills) * 3)

    certs = session.exec(select(Certification).where(Certification.profileId == profile.id)).all()
    if certs:
        score += 15

    projects = session.exec(select(Project).where(Project.profileId == profile.id)).all()
    if len(projects) >= 2:
        score += 15
    elif len(projects) == 1:
        score += 7

    connections = session.exec(select(Connection).where(
        ((Connection.senderId == user_id) | (Connection.receiverId == user_id)),
        Connection.status == "CONNECTED"
    )).all()
    
    if len(connections) >= 3:
        score += 5
    else:
        score += len(connections) * 1.5

    applications = session.exec(select(Application).where(Application.userId == user_id)).all()
    score += min(20, len(applications) * 5)

    experiences = session.exec(select(Experience).where(Experience.profileId == profile.id)).all()
    if experiences:
        score += 10

    final_score = min(100, int(round(score)))
    profile.readinessScore = final_score
    session.add(profile)
    session.commit()
    return final_score

@router.get("/points/status")
async def get_points_status(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    transactions = session.exec(
        select(PointTransaction).where(PointTransaction.userId == user_id).order_by(PointTransaction.createdAt.desc())
    ).all()

    return {
        "edPoints": user.edPoints,
        "transactions": [t.dict() for t in transactions]
    }

@router.post("/points/redeem")
async def redeem_points(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.edPoints < 200:
        raise HTTPException(status_code=400, detail="Insufficient points. You need at least 200 points to redeem.")

    user.edPoints -= 200
    session.add(user)

    tx = PointTransaction(
        id=str(uuid.uuid4()),
        userId=user_id,
        points=-200,
        description="Redeemed 200 Points (Value: ₹20)",
        createdAt=datetime.utcnow()
    )
    session.add(tx)
    session.commit()

    return {
        "success": True,
        "newPoints": user.edPoints,
        "message": "Successfully redeemed 200 points for ₹20!"
    }

@router.get("/readiness")
async def get_readiness_score(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    score = calculate_readiness_score(user_id, session)
    return {"readinessScore": score}

@router.get("/birthdays")
async def get_birthdays(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    today = datetime.utcnow()
    profiles = session.exec(select(Profile).where(Profile.dob != None)).all()
    
    birthday_users = []
    for p in profiles:
        if p.dob.month == today.month and p.dob.day == today.day:
            u = session.exec(select(User).where(User.id == p.userId)).first()
            if u:
                birthday_users.append({
                    "userId": p.userId,
                    "fullName": u.fullName,
                    "email": u.email,
                    "role": u.role,
                    "avatarUrl": p.avatarUrl,
                    "headline": p.headline,
                    "dob": p.dob.isoformat()
                })
    return birthday_users

@router.get("/portfolio/{slug}")
async def get_public_portfolio(slug: str, session: Session = Depends(get_session)):
    profile = session.exec(select(Profile).where(Profile.portfolioUrl == slug)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Portfolio slug not found")

    user = session.exec(select(User).where(User.id == profile.userId)).first()
    projects = session.exec(select(Project).where(Project.profileId == profile.id)).all()
    experiences = session.exec(select(Experience).where(Experience.profileId == profile.id)).all()
    certs = session.exec(select(Certification).where(Certification.profileId == profile.id)).all()
    skills = session.exec(select(Skill).where(Skill.profileId == profile.id)).all()

    profile_dict = profile.dict()
    profile_dict["user"] = {
        "fullName": user.fullName if user else "Unknown User",
        "email": user.email if user else "",
        "phoneNumber": user.phoneNumber if user else None
    }
    profile_dict["projects"] = [p.dict() for p in projects]
    profile_dict["experience"] = [e.dict() for e in experiences]
    profile_dict["certifications"] = [c.dict() for c in certs]
    profile_dict["skills"] = [s.dict() for s in skills]

    return profile_dict

@router.get("/{userId}")
async def get_profile(userId: str, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    profile = session.exec(select(Profile).where(Profile.userId == userId)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    projects = session.exec(select(Project).where(Project.profileId == profile.id)).all()
    experiences = session.exec(select(Experience).where(Experience.profileId == profile.id)).all()
    certs = session.exec(select(Certification).where(Certification.profileId == profile.id)).all()
    skills = session.exec(select(Skill).where(Skill.profileId == profile.id)).all()

    profile_dict = profile.dict()
    profile_dict["projects"] = [p.dict() for p in projects]
    profile_dict["experience"] = [e.dict() for e in experiences]
    profile_dict["certifications"] = [c.dict() for c in certs]
    profile_dict["skills"] = [s.dict() for s in skills]

    return profile_dict

@router.put("/")
async def update_profile(req_data: UpdateProfileSchema, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if req_data.fullName:
        user.fullName = req_data.fullName
        session.add(user)

    if req_data.headline is not None:
        profile.headline = req_data.headline
    if req_data.collegeName is not None:
        profile.collegeName = req_data.collegeName
    if req_data.degree is not None:
        profile.degree = req_data.degree
    if req_data.branch is not None:
        profile.branch = req_data.branch
    if req_data.graduationYear is not None:
        try:
            profile.graduationYear = int(req_data.graduationYear)
        except ValueError:
            raise HTTPException(status_code=400, detail="Graduation year must be an integer")
    if req_data.bio is not None:
        profile.bio = req_data.bio
    if req_data.avatarUrl is not None:
        profile.avatarUrl = req_data.avatarUrl
    if req_data.portfolioUrl is not None:
        profile.portfolioUrl = req_data.portfolioUrl
    if req_data.interests is not None:
        profile.interests = json.dumps(req_data.interests)
    if req_data.goals is not None:
        profile.goals = json.dumps(req_data.goals)
    if req_data.dob is not None:
        if not req_data.dob:
            profile.dob = None
        else:
            try:
                profile.dob = datetime.fromisoformat(req_data.dob.replace("Z", ""))
            except ValueError:
                pass
    if req_data.latitude is not None:
        profile.latitude = req_data.latitude
    if req_data.longitude is not None:
        profile.longitude = req_data.longitude

    session.add(profile)
    session.commit()
    session.refresh(profile)

    new_score = calculate_readiness_score(user_id, session)
    profile_dict = profile.dict()
    profile_dict["readinessScore"] = new_score
    return {"profile": profile_dict}

@router.post("/projects", status_code=201)
async def add_project(req_data: ProjectSchema, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    project = Project(
        id=str(uuid.uuid4()),
        profileId=profile.id,
        title=req_data.title,
        description=req_data.description,
        technologies=json.dumps(req_data.technologies),
        projectUrl=req_data.projectUrl,
        githubUrl=req_data.githubUrl
    )
    session.add(project)
    session.commit()
    session.refresh(project)

    calculate_readiness_score(user_id, session)
    return project

@router.delete("/projects/{proj_id}")
async def delete_project(proj_id: str, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    project = session.exec(select(Project).where(Project.id == proj_id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    profile = session.exec(select(Profile).where(Profile.id == project.profileId)).first()
    if not profile or profile.userId != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Cannot delete another user's project")

    session.delete(project)
    session.commit()
    calculate_readiness_score(user_id, session)
    return {"success": True}

@router.post("/skills", status_code=201)
async def add_skill(req_data: SkillSchema, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    skill = Skill(
        id=str(uuid.uuid4()),
        profileId=profile.id,
        name=req_data.name
    )
    session.add(skill)
    session.commit()
    session.refresh(skill)

    calculate_readiness_score(user_id, session)
    return skill

@router.delete("/skills/{skill_id}")
async def delete_skill(skill_id: str, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    skill = session.exec(select(Skill).where(Skill.id == skill_id)).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    profile = session.exec(select(Profile).where(Profile.id == skill.profileId)).first()
    if not profile or profile.userId != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Cannot delete another user's skill")

    session.delete(skill)
    session.commit()
    calculate_readiness_score(user_id, session)
    return {"success": True}

@router.post("/certifications", status_code=201)
async def add_certification(req_data: CertificationSchema, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    try:
        issue_date = datetime.fromisoformat(req_data.issueDate.replace("Z", ""))
        expiry_date = datetime.fromisoformat(req_data.expiryDate.replace("Z", "")) if req_data.expiryDate else None
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    cert = Certification(
        id=str(uuid.uuid4()),
        profileId=profile.id,
        name=req_data.name,
        issuer=req_data.issuer,
        issueDate=issue_date,
        expiryDate=expiry_date,
        credentialId=req_data.credentialId
    )
    session.add(cert)
    session.commit()
    session.refresh(cert)

    calculate_readiness_score(user_id, session)
    return cert

@router.post("/experience", status_code=201)
async def add_experience(req_data: ExperienceSchema, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    try:
        start_date = datetime.fromisoformat(req_data.startDate.replace("Z", ""))
        end_date = datetime.fromisoformat(req_data.endDate.replace("Z", "")) if req_data.endDate else None
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    exp = Experience(
        id=str(uuid.uuid4()),
        profileId=profile.id,
        company=req_data.company,
        role=req_data.role,
        startDate=start_date,
        endDate=end_date,
        description=req_data.description
    )
    session.add(exp)
    session.commit()
    session.refresh(exp)

    calculate_readiness_score(user_id, session)
    return exp

@router.delete("/experience/{exp_id}")
async def delete_experience(exp_id: str, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    exp = session.exec(select(Experience).where(Experience.id == exp_id)).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    profile = session.exec(select(Profile).where(Profile.id == exp.profileId)).first()
    if not profile or profile.userId != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Cannot delete another user's experience")

    session.delete(exp)
    session.commit()
    calculate_readiness_score(user_id, session)
    return {"success": True}

@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        raise HTTPException(status_code=400, detail="Only image files are accepted")

    filename = f"{user_id}_avatar_{int(datetime.utcnow().timestamp())}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Delete old avatar
    if profile.avatarUrl and profile.avatarUrl.startswith("/uploads/avatars/"):
        old_path = os.path.join(os.getcwd(), profile.avatarUrl.lstrip("/"))
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass

    profile.avatarUrl = f"/uploads/avatars/{filename}"
    session.add(profile)
    session.commit()
    session.refresh(profile)

    calculate_readiness_score(user_id, session)
    return {"avatarUrl": profile.avatarUrl}

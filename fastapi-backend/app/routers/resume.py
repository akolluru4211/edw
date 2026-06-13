import os
import uuid
import json
import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select

from app.database import get_session
from app.models import Resume, Profile, Skill
from app.auth import get_current_user
from app.routers.profile import calculate_readiness_score

router = APIRouter(prefix="/resume", tags=["resume"])

RESUMES_DIR = os.path.join(os.getcwd(), "uploads", "resumes")
os.makedirs(RESUMES_DIR, exist_ok=True)

def analyze_resume(user_id: str, filename: str, session: Session):
    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    
    user_skills = []
    if profile:
        skills = session.exec(select(Skill).where(Skill.profileId == profile.id)).all()
        user_skills = [s.name.lower() for s in skills]

    ats_keywords = ['javascript', 'typescript', 'python', 'react', 'node', 'sql', 'git', 'docker', 'ci/cd', 'system design']
    matched = [kw for kw in ats_keywords if kw in user_skills]
    missing = [kw for kw in ats_keywords if kw not in user_skills]

    base_score = 40
    skill_bonus = min(len(matched) * 6, 36)
    profile_bonus = 0
    if profile:
        profile_bonus += 8 if profile.bio else 0
        profile_bonus += 8 if profile.collegeName else 0
    profile_bonus += 8 if len(user_skills) >= 3 else 0
    
    ats_score = min(base_score + skill_bonus + profile_bonus, 100)

    keyword_report = [
        f'✅ Resume file "{filename}" successfully uploaded and parsed.',
        f'✅ {len(matched)} technical keywords matched: {", ".join(matched) if matched else "None yet — add skills in your portfolio."}',
        f'⚠️ ATS score is {ats_score}%. Add more skills and fill your bio to improve visibility.' if ats_score < 70 else f'✅ ATS score of {ats_score}% — excellent keyword optimization!',
        f'💡 Consider adding these keywords if you have them: "{", ".join(missing[:4])}"' if missing else '💡 Tip: Add your LinkedIn and GitHub URLs to your resume header for extra recruiter visibility.'
    ]

    return ats_score, keyword_report

@router.post("/upload", status_code=201)
async def upload_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are accepted")

    safe_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in file.filename)
    filename = f"{user_id}_{int(datetime.utcnow().timestamp())}_{safe_name}"
    dest_path = os.path.join(RESUMES_DIR, filename)

    # Save physical file
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"/uploads/resumes/{filename}"
    ats_score, report = analyze_resume(user_id, file.filename, session)

    new_resume = Resume(
        id=str(uuid.uuid4()),
        userId=user_id,
        fileName=file.filename,
        fileUrl=file_url,
        atsScore=ats_score,
        keywordReport=json.dumps(report),
        uploadedAt=datetime.utcnow()
    )
    session.add(new_resume)
    session.commit()
    session.refresh(new_resume)

    # Re-calc readiness score
    calculate_readiness_score(user_id, session)

    return new_resume

@router.get("/")
async def get_resumes(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    resumes = session.exec(
        select(Resume).where(Resume.userId == user_id).order_by(Resume.uploadedAt.desc())
    ).all()
    return resumes

@router.delete("/{resume_id}")
async def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    resume = session.exec(select(Resume).where(Resume.id == resume_id)).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if resume.userId != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Delete physical file
    if resume.fileUrl.startswith("/uploads/"):
        filePath = os.path.join(os.getcwd(), resume.fileUrl.lstrip("/"))
        if os.path.exists(filePath):
            try:
                os.remove(filePath)
            except Exception:
                pass

    session.delete(resume)
    session.commit()
    
    # Re-calc readiness score
    calculate_readiness_score(user_id, session)

    return {"success": True}

import os
import re
import secrets
import random
import httpx
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.database import get_session
from app.models import User, Profile, PointTransaction, DataLog, PasswordResetOTP
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from app.email import send_email, get_email_template

router = APIRouter(prefix="/auth", tags=["auth"])

SUPABASE_URL = "https://zfmprakiunbqsisqsiet.supabase.co"
SUPABASE_KEY = "sb_publishable_7AxFqBP4O2Otz6y1jFcn4A_6WOrXTBH"

# Password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^-])[A-Za-z\d@$!%*?&_#^-]{8,}$")

class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    phoneNumber: Optional[str] = None
    collegeName: str
    degree: str
    branch: str
    graduationYear: str
    interests: Optional[List[str]] = []
    goals: Optional[List[str]] = []
    dob: Optional[str] = None
    publicKey: Optional[str] = None
    encryptedPrivateKey: Optional[str] = None
    keySalt: Optional[str] = None
    keyIv: Optional[str] = None

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordSchema(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel):
    email: EmailStr
    code: str
    newPassword: str

class SaveKeysSchema(BaseModel):
    publicKey: str
    encryptedPrivateKey: str
    keySalt: str
    keyIv: str

@router.post("/register")
async def register(req_data: RegisterSchema, request: Request, session: Session = Depends(get_session)):
    email = req_data.email.lower()
    password = req_data.password

    try:
        grad_year_num = int(req_data.graduationYear)
    except ValueError:
        raise HTTPException(status_code=400, detail="Graduation year must be a valid integer")

    if not PASSWORD_REGEX.match(password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )

    # Check local user
    existing_user = session.exec(select(User).where(User.email == email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Supabase Auth sign up
    supabase_user_id = None
    async with httpx.AsyncClient() as client:
        try:
            sb_res = await client.post(
                f"{SUPABASE_URL}/auth/v1/signup",
                json={"email": email, "password": password},
                headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
            )
            sb_data = sb_res.json()
            if sb_res.status_code >= 400:
                error_msg = sb_data.get("msg") or sb_data.get("error_description") or "Supabase Auth signup failed"
                if "already" in error_msg.lower() or "exists" in error_msg.lower():
                    raise HTTPException(status_code=400, detail="An account with this email is already registered in our authentication system. Please sign in instead.")
                raise HTTPException(status_code=400, detail=f"Supabase Auth signup failed: {error_msg}")
            
            supabase_user_id = sb_data.get("id") or sb_data.get("user", {}).get("id")
        except httpx.HTTPError as err:
            raise HTTPException(status_code=400, detail=f"Supabase Auth server error: {str(err)}")

    if not supabase_user_id:
        supabase_user_id = f"local-fallback-{secrets.token_hex(8)}"

    password_hash = hash_password(password)
    name_clean = re.sub(r"[^A-Z]", "", req_data.fullName.upper())
    name_part = (name_clean + "USER")[:4]
    member_id = f"EDW-{name_part}-{random.randint(1000, 9999)}"

    dob_date = None
    if req_data.dob:
        try:
            dob_date = datetime.fromisoformat(req_data.dob.replace("Z", ""))
        except ValueError:
            pass

    import json
    import uuid

    # Create user in local DB
    new_user = User(
        id=supabase_user_id,
        email=email,
        passwordHash=password_hash,
        fullName=req_data.fullName,
        phoneNumber=req_data.phoneNumber,
        role="STUDENT",
        memberId=member_id,
        publicKey=req_data.publicKey,
        encryptedPrivateKey=req_data.encryptedPrivateKey,
        keySalt=req_data.keySalt,
        keyIv=req_data.keyIv,
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow()
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Generate public portfolio URL slug
    slug_name = re.sub(r"[^a-z0-9]+", "-", req_data.fullName.lower())
    portfolio_url = f"{slug_name}-{random.randint(100, 999)}"

    # Create profile
    new_profile = Profile(
        id=str(uuid.uuid4()),
        userId=new_user.id,
        collegeName=req_data.collegeName,
        degree=req_data.degree,
        branch=req_data.branch,
        graduationYear=grad_year_num,
        interests=json.dumps(req_data.interests or []),
        goals=json.dumps(req_data.goals or []),
        portfolioUrl=portfolio_url,
        readinessScore=20,
        dob=dob_date
    )
    session.add(new_profile)

    # Initial Point Transaction
    new_pts = PointTransaction(
        id=str(uuid.uuid4()),
        userId=new_user.id,
        points=50,
        description="Welcome Signup Reward",
        createdAt=datetime.utcnow()
    )
    session.add(new_pts)
    session.commit()

    # Log signup
    log = DataLog(
        id=str(uuid.uuid4()),
        type="SIGNUP",
        email=email,
        ipAddress=request.client.host if request.client else None,
        details=f"User registered successfully. Role: STUDENT, MemberId: {member_id}",
        createdAt=datetime.utcnow()
    )
    session.add(log)
    session.commit()

    # Welcome email (mocked or sent)
    welcome_body = f"""
        <p>Dear {new_user.fullName},</p>
        <p>Thank you for registering at <strong>Edworld Co.</strong>, your premier AI-powered career enhancement workspace.</p>
        <p>Your unique <strong>Member ID</strong> is: <strong>{member_id}</strong></p>
        <p>Here are your next steps to succeed:</p>
        <ul>
          <li>Complete your profile setup to unlock your digital career card.</li>
          <li>Upload your resume for real-time ATS scoring and feedback.</li>
          <li>Schedule simulated coding and behavioral interviews with our AI coach.</li>
        </ul>
        <p>We are thrilled to support you on your professional journey.</p>
        <br>
        <p>Best regards,<br>The Edworld Co. Team</p>
    """
    welcome_html = get_email_template("Welcome to Edworld Co.!", welcome_body)
    send_email(to=new_user.email, subject="Welcome to Edworld Co.!", html=welcome_html)

    token = create_access_token({"id": new_user.id, "email": new_user.email, "role": new_user.role})

    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "fullName": new_user.fullName,
            "role": new_user.role,
            "memberId": new_user.memberId
        }
    }

@router.post("/login")
async def login(req_data: LoginSchema, request: Request, session: Session = Depends(get_session)):
    email = req_data.email.lower()
    password = req_data.password

    user = session.exec(select(User).where(User.email == email)).first()

    supabase_auth_success = False
    supabase_user_id = None

    # Sync login with Supabase
    async with httpx.AsyncClient() as client:
        try:
            sb_res = await client.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                json={"email": email, "password": password},
                headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
            )
            if sb_res.status_code == 200:
                sb_data = sb_res.json()
                supabase_auth_success = True
                supabase_user_id = sb_data.get("user", {}).get("id") or sb_data.get("id")
                print(f"Supabase Auth login synced successfully for {email}")
        except Exception as e:
            print(f"Supabase Auth sync login failed for {email}:", e)

    import uuid
    import json

    if not user:
        if supabase_auth_success and supabase_user_id:
            # Self-healing local user recreation
            password_hash = hash_password(password)
            name_part = email.split("@")[0].upper()
            member_id = f"EDW-{name_part[:4]}-{random.randint(1000, 9999)}"

            user = User(
                id=supabase_user_id,
                email=email,
                passwordHash=password_hash,
                fullName=name_part,
                role="STUDENT",
                memberId=member_id,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )
            session.add(user)
            session.commit()
            session.refresh(user)

            profile = Profile(
                id=str(uuid.uuid4()),
                userId=user.id,
                collegeName="Gitam University",
                degree="B.Tech",
                branch="CSE",
                graduationYear=2026,
                interests="[]",
                goals="[]",
                portfolioUrl=f"{name_part.lower()}-{random.randint(100, 999)}",
                readinessScore=20
            )
            session.add(profile)
            session.commit()
            print(f"Dynamically recreated missing local record for Supabase user: {email}")
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    else:
        # Verify password hash
        if not verify_password(password, user.passwordHash):
            if supabase_auth_success:
                # Password updated in Supabase Auth via recovery, update local database to match!
                user.passwordHash = hash_password(password)
                session.add(user)
                session.commit()
                session.refresh(user)
                print(f"Updated local password hash to match Supabase Auth password reset for {email}")
            else:
                # Log login failure
                log = DataLog(
                    id=str(uuid.uuid4()),
                    type="LOGIN_FAILURE",
                    email=email,
                    ipAddress=request.client.host if request.client else None,
                    details="Incorrect password",
                    createdAt=datetime.utcnow()
                )
                session.add(log)
                session.commit()
                raise HTTPException(status_code=401, detail="Invalid email or password")

        # Auto-register local user in Supabase Auth if missing
        if not supabase_auth_success:
            async with httpx.AsyncClient() as client:
                try:
                    await client.post(
                        f"{SUPABASE_URL}/auth/v1/signup",
                        json={"email": email, "password": password},
                        headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
                    )
                    print(f"Auto-registered {email} in Supabase Auth on login.")
                except Exception as e:
                    print(f"Auto-registration in Supabase Auth failed for {email}:", e)

    # Double check user profile for dashboard output
    profile = session.exec(select(Profile).where(Profile.userId == user.id)).first()

    # Daily login points reward check
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)

    existing_tx = session.exec(
        select(PointTransaction).where(
            PointTransaction.userId == user.id,
            PointTransaction.description == "Daily Login Reward",
            PointTransaction.createdAt >= today_start,
            PointTransaction.createdAt <= today_end
        )
    ).first()

    if not existing_tx:
        user.edPoints += 10
        session.add(user)
        
        new_pt_reward = PointTransaction(
            id=str(uuid.uuid4()),
            userId=user.id,
            points=10,
            description="Daily Login Reward",
            createdAt=datetime.utcnow()
        )
        session.add(new_pt_reward)
        session.commit()
        session.refresh(user)

    # Log success
    log = DataLog(
        id=str(uuid.uuid4()),
        type="LOGIN_SUCCESS",
        email=email,
        ipAddress=request.client.host if request.client else None,
        details=f"User logged in. Role: {user.role}",
        createdAt=datetime.utcnow()
    )
    session.add(log)
    session.commit()

    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})

    # Prepare response profile dict
    profile_data = None
    if profile:
        profile_data = {
            "id": profile.id,
            "userId": profile.userId,
            "collegeName": profile.collegeName,
            "degree": profile.degree,
            "branch": profile.branch,
            "graduationYear": profile.graduationYear,
            "headline": profile.headline,
            "interests": profile.interests,
            "goals": profile.goals,
            "readinessScore": profile.readinessScore,
            "bio": profile.bio,
            "avatarUrl": profile.avatarUrl,
            "portfolioUrl": profile.portfolioUrl,
            "dob": profile.dob.isoformat() if profile.dob else None
        }

    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "role": user.role,
            "memberId": user.memberId,
            "publicKey": user.publicKey,
            "encryptedPrivateKey": user.encryptedPrivateKey,
            "keySalt": user.keySalt,
            "keyIv": user.keyIv,
            "edPoints": user.edPoints,
            "profile": profile_data
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = session.exec(select(Profile).where(Profile.userId == user_id)).first()
    
    # We fetch resume relations simply
    from app.models import Resume, Project, Experience, Certification, Skill
    resumes = session.exec(select(Resume).where(Resume.userId == user_id)).all()
    
    profile_data = None
    if profile:
        # Load related data for profile
        projects = session.exec(select(Project).where(Project.profileId == profile.id)).all()
        experiences = session.exec(select(Experience).where(Experience.profileId == profile.id)).all()
        certs = session.exec(select(Certification).where(Certification.profileId == profile.id)).all()
        skills = session.exec(select(Skill).where(Skill.profileId == profile.id)).all()

        profile_data = {
            "id": profile.id,
            "userId": profile.userId,
            "collegeName": profile.collegeName,
            "degree": profile.degree,
            "branch": profile.branch,
            "graduationYear": profile.graduationYear,
            "headline": profile.headline,
            "interests": profile.interests,
            "goals": profile.goals,
            "readinessScore": profile.readinessScore,
            "bio": profile.bio,
            "avatarUrl": profile.avatarUrl,
            "portfolioUrl": profile.portfolioUrl,
            "dob": profile.dob.isoformat() if profile.dob else None,
            "projects": [p.dict() for p in projects],
            "experience": [e.dict() for e in experiences],
            "certifications": [c.dict() for c in certs],
            "skills": [s.dict() for s in skills]
        }

    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.fullName,
        "role": user.role,
        "memberId": user.memberId,
        "publicKey": user.publicKey,
        "encryptedPrivateKey": user.encryptedPrivateKey,
        "keySalt": user.keySalt,
        "keyIv": user.keyIv,
        "edPoints": user.edPoints,
        "profile": profile_data,
        "resumes": [r.dict() for r in resumes]
    }

@router.post("/forgot-password")
async def forgot_password(req_data: ForgotPasswordSchema, request: Request, session: Session = Depends(get_session)):
    email = req_data.email.lower()
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email does not exist")

    token = secrets.token_hex(16)
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    import uuid
    # Upsert reset token
    existing_otp = session.exec(select(PasswordResetOTP).where(PasswordResetOTP.email == email)).first()
    if existing_otp:
        existing_otp.code = token
        existing_otp.expiresAt = expires_at
        session.add(existing_otp)
    else:
        new_otp = PasswordResetOTP(
            id=str(uuid.uuid4()),
            email=email,
            code=token,
            expiresAt=expires_at,
            createdAt=datetime.utcnow()
        )
        session.add(new_otp)
    session.commit()

    # Detect referer and construct reset link
    referer = request.headers.get("referer")
    origin = "http://localhost:3001"
    if referer:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(referer)
            origin = f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            pass
            
    reset_link = f"{origin}/reset-password?email={email}&code={token}"

    reset_body = f"""
        <p>Dear {user.fullName},</p>
        <p>You requested to reset your password for your <strong>Edworld Co.</strong> workspace.</p>
        <p>Please click the button below to recover your account and choose a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_link}" style="background-color: #0284c7; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">Reset Password</a>
        </div>
        <p>If the button above does not work, you can copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #64748b; font-size: 13px; font-family: monospace; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">{reset_link}</p>
        <p>This link is valid for 15 minutes. If you did not make this request, you can safely ignore this email.</p>
        <br>
        <p>Best regards,<br>The Edworld Co. Team</p>
    """
    reset_html = get_email_template("Reset Your Password", reset_body)
    send_email(to=email, subject="Edworld Co. - Reset Your Password", html=reset_html)

    return {"success": True, "message": "Password reset link has been sent to your email."}

@router.post("/reset-password")
async def reset_password(req_data: ResetPasswordSchema, request: Request, session: Session = Depends(get_session)):
    email = req_data.email.lower()
    code = req_data.code
    new_password = req_data.newPassword

    if not PASSWORD_REGEX.match(new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )

    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email does not exist")

    record = session.exec(select(PasswordResetOTP).where(PasswordResetOTP.email == email)).first()
    if not record or record.code != code or record.expiresAt < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired password reset link")

    # Update password locally
    user.passwordHash = hash_password(new_password)
    session.add(user)

    # Delete verification record
    session.delete(record)
    session.commit()

    import uuid
    # Log reset
    log = DataLog(
        id=str(uuid.uuid4()),
        type="PASSWORD_RESET",
        email=email,
        ipAddress=request.client.host if request.client else None,
        details="User reset their password successfully using OTP verification.",
        createdAt=datetime.utcnow()
    )
    session.add(log)
    session.commit()

    return {"success": True, "message": "Password has been reset successfully."}

@router.post("/save-keys")
async def save_keys(req_data: SaveKeysSchema, current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user_id = current_user.get("id")
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.publicKey = req_data.publicKey
    user.encryptedPrivateKey = req_data.encryptedPrivateKey
    user.keySalt = req_data.keySalt
    user.keyIv = req_data.keyIv

    session.add(user)
    session.commit()

    return {"success": True}

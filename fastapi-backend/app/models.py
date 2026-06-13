from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

# Shared Base Model with standard config
class BaseConfig(SQLModel):
    pass

class User(SQLModel, table=True):
    __tablename__ = "User"
    
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    passwordHash: str
    fullName: str
    phoneNumber: Optional[str] = None
    role: str = Field(default="STUDENT")
    memberId: Optional[str] = Field(default=None, unique=True)
    publicKey: Optional[str] = None
    encryptedPrivateKey: Optional[str] = None
    keySalt: Optional[str] = None
    keyIv: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    edPoints: int = Field(default=50)

class Profile(SQLModel, table=True):
    __tablename__ = "Profile"
    
    id: str = Field(primary_key=True)
    userId: str = Field(unique=True, index=True)
    collegeName: str
    degree: str
    branch: str
    graduationYear: int
    headline: Optional[str] = None
    interests: str = Field(default="[]")
    goals: str = Field(default="[]")
    readinessScore: int = Field(default=0)
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None
    portfolioUrl: Optional[str] = Field(default=None, unique=True)
    dob: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Resume(SQLModel, table=True):
    __tablename__ = "Resume"
    
    id: str = Field(primary_key=True)
    userId: str = Field(index=True)
    fileName: str
    fileUrl: str
    atsScore: int = Field(default=0)
    keywordReport: str = Field(default="[]")
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)

class Project(SQLModel, table=True):
    __tablename__ = "Project"
    
    id: str = Field(primary_key=True)
    profileId: str = Field(index=True)
    title: str
    description: str
    technologies: str = Field(default="[]")
    projectUrl: Optional[str] = None
    githubUrl: Optional[str] = None

class Experience(SQLModel, table=True):
    __tablename__ = "Experience"
    
    id: str = Field(primary_key=True)
    profileId: str = Field(index=True)
    company: str
    role: str
    startDate: datetime
    endDate: Optional[datetime] = None
    description: str

class Certification(SQLModel, table=True):
    __tablename__ = "Certification"
    
    id: str = Field(primary_key=True)
    profileId: str = Field(index=True)
    name: str
    issuer: str
    issueDate: datetime
    expiryDate: Optional[datetime] = None
    credentialId: Optional[str] = None
    courseId: Optional[str] = None

class Skill(SQLModel, table=True):
    __tablename__ = "Skill"
    
    id: str = Field(primary_key=True)
    profileId: str = Field(index=True)
    name: str

class Opportunity(SQLModel, table=True):
    __tablename__ = "Opportunity"
    
    id: str = Field(primary_key=True)
    title: str
    companyName: str
    companyType: str = Field(default="STARTUP")
    location: str
    salary: Optional[str] = None
    remote: bool = Field(default=False)
    type: str  # JOB, INTERNSHIP, HACKATHON, SCHOLARSHIP
    skillsRequired: str = Field(default="[]")
    description: str
    externalLink: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Application(SQLModel, table=True):
    __tablename__ = "Application"
    
    id: str = Field(primary_key=True)
    userId: str
    opportunityId: str = Field(index=True)
    status: str = Field(default="APPLIED")
    appliedAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Connection(SQLModel, table=True):
    __tablename__ = "Connection"
    
    id: str = Field(primary_key=True)
    senderId: str
    receiverId: str = Field(index=True)
    status: str  # PENDING, CONNECTED
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Message(SQLModel, table=True):
    __tablename__ = "Message"
    
    id: str = Field(primary_key=True)
    senderId: str = Field(index=True)
    receiverId: str = Field(index=True)
    text: str
    textForSender: Optional[str] = None
    textForReceiver: Optional[str] = None
    read: bool = Field(default=False)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Notification(SQLModel, table=True):
    __tablename__ = "Notification"
    
    id: str = Field(primary_key=True)
    userId: str = Field(index=True)
    title: str
    text: str
    read: bool = Field(default=False)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Course(SQLModel, table=True):
    __tablename__ = "Course"
    
    id: str = Field(primary_key=True)
    title: str
    description: str
    durationHours: int
    skillsEarned: str = Field(default="[]")
    category: str

class Post(SQLModel, table=True):
    __tablename__ = "Post"
    
    id: str = Field(primary_key=True)
    userId: str = Field(index=True)
    title: str
    content: str
    likesCount: int = Field(default=0)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Comment(SQLModel, table=True):
    __tablename__ = "Comment"
    
    id: str = Field(primary_key=True)
    postId: str = Field(index=True)
    userId: str = Field(index=True)
    content: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class AIChat(SQLModel, table=True):
    __tablename__ = "AIChat"
    
    id: str = Field(primary_key=True)
    userId: str = Field(index=True)
    title: str
    messages: str = Field(default="[]")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class DataLog(SQLModel, table=True):
    __tablename__ = "DataLog"
    
    id: str = Field(primary_key=True)
    type: str  # LOGIN_SUCCESS, LOGIN_FAILURE, SIGNUP, PASSWORD_RESET, BULK_ANNOUNCEMENT
    email: str
    ipAddress: Optional[str] = None
    details: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class PasswordResetOTP(SQLModel, table=True):
    __tablename__ = "PasswordResetOTP"
    
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    code: str
    expiresAt: datetime
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class PointTransaction(SQLModel, table=True):
    __tablename__ = "PointTransaction"
    
    id: str = Field(primary_key=True)
    userId: str = Field(index=True)
    points: int
    description: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

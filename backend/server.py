from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request, status, UploadFile, File, Form
from fastapi.security import HTTPBearer
from fastapi.responses import FileResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
import bcrypt
import jwt
import asyncio
import httpx
import resend
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from user_agents import parse as parse_user_agent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Uploads directory for proposals
UPLOADS_DIR = ROOT_DIR / "uploads" / "proposals"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend setup
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'thco-super-secret-key-2024')
JWT_ALGORITHM = 'HS256'
SESSION_EXPIRY_DAYS = 7

# Create the main app
app = FastAPI(title="THCO Internal Portal API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "team_member"  # super_admin, mini_admin, team_member
    accessible_units: List[str] = []
    status: str = "active"  # active, disabled

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    role: str
    accessible_units: List[str]
    status: str
    picture: Optional[str] = None
    created_at: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    accessible_units: Optional[List[str]] = None
    status: Optional[str] = None
    device_lock_enabled: Optional[bool] = None
    allowed_device_fingerprint: Optional[str] = None

class LoginRecordResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    record_id: str
    user_id: str
    user_name: str
    user_email: str
    login_time: datetime
    ip_address: str
    location: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device_type: str
    device_os: str
    browser: str
    user_agent: str
    device_fingerprint: str
    login_method: str
    success: bool
    failure_reason: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class SourcingRequestCreate(BaseModel):
    job_title: str
    job_description: str
    company_name: str
    company_website: str
    company_location: str
    hiring_locations: str
    salary_budget: Optional[str] = ""
    target_companies: Optional[str] = ""
    companies_to_exclude: Optional[str] = ""
    accept_n_minus_one: str
    industry_segments: Optional[str] = ""
    additional_notes: Optional[str] = ""
    assigned_recruiter: str

class SourcingRequestResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    request_id: str
    user_id: str
    job_title: str
    job_description: str
    company_name: str
    company_website: str
    company_location: str
    hiring_locations: str
    salary_budget: str
    target_companies: str
    companies_to_exclude: str
    accept_n_minus_one: str
    industry_segments: str
    additional_notes: str
    assigned_recruiter: str
    requester_email: str
    status: str
    created_at: datetime

class DatabaseSearchCreate(BaseModel):
    job_title: str
    job_description: str
    company_context: Optional[str] = ""
    seniority_level: str
    max_candidates: str

class DatabaseSearchResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    search_id: str
    user_id: str
    job_title: str
    job_description: str
    company_context: str
    seniority_level: str
    max_candidates: str
    status: str
    created_at: datetime

class WebhookConfig(BaseModel):
    sourcing_webhook_url: Optional[str] = ""
    database_search_webhook_url: Optional[str] = ""

class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    log_id: str
    user_id: str
    user_name: str
    action: str
    unit_slug: str
    entity_type: str
    entity_id: str
    details: str
    created_at: datetime

# ==================== PROPOSAL MODELS ====================

class ClientCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class ClientResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    client_id: str
    name: str
    description: str
    proposal_count: int
    created_by: str
    created_at: datetime

class ProposalResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    proposal_id: str
    client_id: str
    client_name: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    share_token: str
    share_url: str
    uploaded_by: str
    uploaded_by_name: str
    created_at: datetime

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRY_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(request: Request) -> dict:
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Then try Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check session in database
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if user.get("status") == "disabled":
        raise HTTPException(status_code=403, detail="Account disabled")
    
    return user

async def log_activity(user_id: str, user_name: str, action: str, unit_slug: str = "", entity_type: str = "", entity_id: str = "", details: str = ""):
    log_doc = {
        "log_id": f"log_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "user_name": user_name,
        "action": action,
        "unit_slug": unit_slug,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.activity_logs.insert_one(log_doc)

async def get_webhook_url(key: str) -> str:
    settings = await db.app_settings.find_one({"setting_type": "webhooks"}, {"_id": 0})
    if settings:
        return settings.get(key, "")
    return ""

# ==================== LOGIN TRACKING HELPERS ====================

def parse_device_info(user_agent_string: str) -> dict:
    """Parse user agent string to extract device information"""
    try:
        ua = parse_user_agent(user_agent_string)
        device_type = "Desktop"
        if ua.is_mobile:
            device_type = "Mobile"
        elif ua.is_tablet:
            device_type = "Tablet"
        elif ua.is_bot:
            device_type = "Bot"
        
        return {
            "device_type": device_type,
            "device_os": f"{ua.os.family} {ua.os.version_string}".strip(),
            "browser": f"{ua.browser.family} {ua.browser.version_string}".strip(),
            "device_family": ua.device.family,
            "is_mobile": ua.is_mobile,
            "is_tablet": ua.is_tablet,
            "is_pc": ua.is_pc
        }
    except Exception as e:
        logger.error(f"Failed to parse user agent: {e}")
        return {
            "device_type": "Unknown",
            "device_os": "Unknown",
            "browser": "Unknown",
            "device_family": "Unknown",
            "is_mobile": False,
            "is_tablet": False,
            "is_pc": True
        }

def generate_device_fingerprint(user_agent: str, ip_address: str) -> str:
    """Generate a device fingerprint based on user agent and IP"""
    # Use only user agent for fingerprint so same device can login from different networks
    fingerprint_data = f"{user_agent}"
    return hashlib.sha256(fingerprint_data.encode()).hexdigest()[:32]

async def get_ip_location(ip_address: str) -> dict:
    """Get location information from IP address using free API"""
    try:
        # Skip for localhost/private IPs
        if ip_address in ["127.0.0.1", "localhost", "::1"] or ip_address.startswith("192.168.") or ip_address.startswith("10."):
            return {"country": "Local", "city": "Local", "location": "Local Network"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://ip-api.com/json/{ip_address}?fields=status,country,city,regionName,isp", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    return {
                        "country": data.get("country", "Unknown"),
                        "city": data.get("city", "Unknown"),
                        "region": data.get("regionName", ""),
                        "isp": data.get("isp", ""),
                        "location": f"{data.get('city', '')}, {data.get('country', '')}"
                    }
    except Exception as e:
        logger.error(f"Failed to get IP location: {e}")
    
    return {"country": "Unknown", "city": "Unknown", "location": "Unknown"}

def get_client_ip(request: Request) -> str:
    """Extract the real client IP from request headers"""
    # Check for forwarded headers (in case of proxy/load balancer)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip
    
    return request.client.host if request.client else "Unknown"

async def record_login_attempt(
    user_id: str,
    user_name: str,
    user_email: str,
    request: Request,
    login_method: str,
    success: bool,
    failure_reason: str = None
) -> dict:
    """Record a login attempt with full device and location tracking"""
    user_agent = request.headers.get("user-agent", "Unknown")
    ip_address = get_client_ip(request)
    device_info = parse_device_info(user_agent)
    location_info = await get_ip_location(ip_address)
    device_fingerprint = generate_device_fingerprint(user_agent, ip_address)
    
    login_record = {
        "record_id": f"login_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "user_name": user_name,
        "user_email": user_email,
        "login_time": datetime.now(timezone.utc).isoformat(),
        "ip_address": ip_address,
        "location": location_info.get("location", "Unknown"),
        "country": location_info.get("country", "Unknown"),
        "city": location_info.get("city", "Unknown"),
        "device_type": device_info.get("device_type", "Unknown"),
        "device_os": device_info.get("device_os", "Unknown"),
        "browser": device_info.get("browser", "Unknown"),
        "user_agent": user_agent,
        "device_fingerprint": device_fingerprint,
        "login_method": login_method,
        "success": success,
        "failure_reason": failure_reason
    }
    
    await db.login_records.insert_one(login_record)
    return login_record

async def check_device_lock(user: dict, request: Request) -> tuple:
    """Check if user is allowed to login from this device"""
    if not user.get("device_lock_enabled", False):
        return True, None
    
    allowed_fingerprint = user.get("allowed_device_fingerprint")
    if not allowed_fingerprint:
        return True, None  # No device registered yet
    
    user_agent = request.headers.get("user-agent", "Unknown")
    ip_address = get_client_ip(request)
    current_fingerprint = generate_device_fingerprint(user_agent, ip_address)
    
    if current_fingerprint != allowed_fingerprint:
        device_info = parse_device_info(user_agent)
        return False, f"Login blocked: Device not authorized. Current device: {device_info['device_type']} - {device_info['browser']} on {device_info['device_os']}"
    
    return True, None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if this is the first user (make them super_admin)
    user_count = await db.users.count_documents({})
    role = "super_admin" if user_count == 0 else "team_member"
    
    # All units for reference
    all_units = ["talent", "sales", "marketing", "advisory", "technology", "operations", "academy", "client-delivery"]
    accessible_units = all_units if role == "super_admin" else []
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "role": role,
        "accessible_units": accessible_units,
        "status": "active",
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRY_DAYS)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=SESSION_EXPIRY_DAYS * 24 * 60 * 60
    )
    
    await log_activity(user_id, user_data.name, "User registered", details=f"Role: {role}")
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "role": role,
        "accessible_units": accessible_units,
        "status": "active",
        "session_token": session_token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, request: Request, response: Response):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        # Record failed login attempt
        await record_login_attempt(
            user_id="unknown",
            user_name="Unknown",
            user_email=credentials.email,
            request=request,
            login_method="email_password",
            success=False,
            failure_reason="Invalid credentials - user not found"
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user.get("password_hash", "")):
        await record_login_attempt(
            user_id=user["user_id"],
            user_name=user["name"],
            user_email=user["email"],
            request=request,
            login_method="email_password",
            success=False,
            failure_reason="Invalid credentials - wrong password"
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.get("status") == "disabled":
        await record_login_attempt(
            user_id=user["user_id"],
            user_name=user["name"],
            user_email=user["email"],
            request=request,
            login_method="email_password",
            success=False,
            failure_reason="Account disabled"
        )
        raise HTTPException(status_code=403, detail="Account disabled")
    
    # Check device lock
    device_allowed, block_reason = await check_device_lock(user, request)
    if not device_allowed:
        await record_login_attempt(
            user_id=user["user_id"],
            user_name=user["name"],
            user_email=user["email"],
            request=request,
            login_method="email_password",
            success=False,
            failure_reason=block_reason
        )
        raise HTTPException(status_code=403, detail=block_reason)
    
    # Record successful login
    login_record = await record_login_attempt(
        user_id=user["user_id"],
        user_name=user["name"],
        user_email=user["email"],
        request=request,
        login_method="email_password",
        success=True
    )
    
    # Create new session
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user["user_id"],
        "session_token": session_token,
        "device_fingerprint": login_record["device_fingerprint"],
        "ip_address": login_record["ip_address"],
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRY_DAYS)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=SESSION_EXPIRY_DAYS * 24 * 60 * 60
    )
    
    await log_activity(user["user_id"], user["name"], "User logged in", details=f"IP: {login_record['ip_address']}, Device: {login_record['device_type']}")
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "accessible_units": user.get("accessible_units", []),
        "status": user["status"],
        "picture": user.get("picture"),
        "session_token": session_token
    }

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange Emergent OAuth session_id for user session"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Call Emergent auth service
    async with httpx.AsyncClient() as http_client:
        try:
            auth_response = await http_client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = auth_response.json()
        except Exception as e:
            logger.error(f"OAuth session exchange failed: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")
    
    email = auth_data.get("email")
    name = auth_data.get("name", "")
    picture = auth_data.get("picture", "")
    
    # Check if user exists
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user:
        # Check device lock for existing user
        device_allowed, block_reason = await check_device_lock(user, request)
        if not device_allowed:
            await record_login_attempt(
                user_id=user["user_id"],
                user_name=user["name"],
                user_email=user["email"],
                request=request,
                login_method="google_oauth",
                success=False,
                failure_reason=block_reason
            )
            raise HTTPException(status_code=403, detail=block_reason)
        
        # Update existing user
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}}
        )
        user_id = user["user_id"]
        role = user["role"]
        accessible_units = user.get("accessible_units", [])
        status = user["status"]
        
        if status == "disabled":
            await record_login_attempt(
                user_id=user["user_id"],
                user_name=user["name"],
                user_email=user["email"],
                request=request,
                login_method="google_oauth",
                success=False,
                failure_reason="Account disabled"
            )
            raise HTTPException(status_code=403, detail="Account disabled")
    else:
        # Check if first user
        user_count = await db.users.count_documents({})
        role = "super_admin" if user_count == 0 else "team_member"
        all_units = ["talent", "sales", "marketing", "advisory", "technology", "operations", "academy", "client-delivery"]
        accessible_units = all_units if role == "super_admin" else []
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "password_hash": "",
            "name": name,
            "role": role,
            "accessible_units": accessible_units,
            "status": "active",
            "picture": picture,
            "device_lock_enabled": False,
            "allowed_device_fingerprint": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        status = "active"
        await log_activity(user_id, name, "User registered via Google OAuth", details=f"Role: {role}")
    
    # Record successful login
    login_record = await record_login_attempt(
        user_id=user_id,
        user_name=name,
        user_email=email,
        request=request,
        login_method="google_oauth",
        success=True
    )
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "device_fingerprint": login_record["device_fingerprint"],
        "ip_address": login_record["ip_address"],
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRY_DAYS)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=SESSION_EXPIRY_DAYS * 24 * 60 * 60
    )
    
    await log_activity(user_id, name, "User logged in via Google OAuth", details=f"IP: {login_record['ip_address']}, Device: {login_record['device_type']}")
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "role": role,
        "accessible_units": accessible_units,
        "status": status,
        "picture": picture,
        "session_token": session_token
    }

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "accessible_units": user.get("accessible_units", []),
        "status": user["status"],
        "picture": user.get("picture")
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out successfully"}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: PasswordResetRequest):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = f"reset_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "token": reset_token,
        "user_id": user["user_id"],
        "email": data.email,
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Send email via Resend
    if resend.api_key:
        try:
            reset_link = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"
            params = {
                "from": SENDER_EMAIL,
                "to": [data.email],
                "subject": "THCO Portal - Password Reset",
                "html": f"""
                <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0D0F1A; color: #E8E6F0;">
                    <h1 style="color: #7C64FF;">Password Reset</h1>
                    <p>You requested to reset your password for THCO Portal.</p>
                    <p>Click the link below to set a new password:</p>
                    <a href="{reset_link}" style="display: inline-block; padding: 12px 24px; background-color: #7C64FF; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
                    <p style="color: #8B8AA0; font-size: 14px;">This link expires in 1 hour.</p>
                    <p style="color: #8B8AA0; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
                """
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send reset email: {e}")
    
    return {"message": "If the email exists, a reset link has been sent"}

@api_router.post("/auth/reset-password")
async def reset_password(data: PasswordResetConfirm):
    reset_doc = await db.password_resets.find_one({"token": data.token, "used": False}, {"_id": 0})
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    expires_at = datetime.fromisoformat(reset_doc["expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")
    
    # Update password
    await db.users.update_one(
        {"user_id": reset_doc["user_id"]},
        {"$set": {"password_hash": hash_password(data.new_password)}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successfully"}

# ==================== USER MANAGEMENT ROUTES ====================

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(request: Request):
    current_user = await get_current_user(request)
    if current_user["role"] not in ["super_admin", "mini_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    # Convert timestamps
    for user in users:
        if isinstance(user.get("created_at"), str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    return users

@api_router.post("/users")
async def create_user(user_data: dict, request: Request):
    current_user = await get_current_user(request)
    if current_user["role"] not in ["super_admin", "mini_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Mini admins can only create team members
    if current_user["role"] == "mini_admin" and user_data.get("role") != "team_member":
        raise HTTPException(status_code=403, detail="Mini admins can only create team members")
    
    # Check if email exists
    existing = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Generate temp password
    temp_password = f"temp_{uuid.uuid4().hex[:8]}"
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    new_user = {
        "user_id": user_id,
        "email": user_data["email"],
        "password_hash": hash_password(temp_password),
        "name": user_data["name"],
        "role": user_data.get("role", "team_member"),
        "accessible_units": user_data.get("accessible_units", []),
        "status": "active",
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(new_user)
    
    await log_activity(
        current_user["user_id"], 
        current_user["name"], 
        f"Created user {user_data['name']}", 
        details=f"Role: {new_user['role']}"
    )
    
    return {
        "user_id": user_id,
        "email": user_data["email"],
        "name": user_data["name"],
        "role": new_user["role"],
        "accessible_units": new_user["accessible_units"],
        "status": "active",
        "temp_password": temp_password
    }

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, updates: UserUpdate, request: Request):
    current_user = await get_current_user(request)
    if current_user["role"] not in ["super_admin", "mini_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mini admins can't change roles or manage other admins
    if current_user["role"] == "mini_admin":
        if updates.role is not None:
            raise HTTPException(status_code=403, detail="Mini admins cannot change roles")
        if target_user["role"] in ["super_admin", "mini_admin"]:
            raise HTTPException(status_code=403, detail="Cannot manage admin users")
    
    # Super admins can't demote themselves
    if current_user["user_id"] == user_id and updates.role and updates.role != "super_admin":
        raise HTTPException(status_code=403, detail="Cannot change your own role")
    
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    if update_dict:
        await db.users.update_one({"user_id": user_id}, {"$set": update_dict})
    
    await log_activity(
        current_user["user_id"],
        current_user["name"],
        f"Updated user {target_user['name']}",
        details=str(update_dict)
    )
    
    return {"message": "User updated successfully"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    current_user = await get_current_user(request)
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can delete users")
    
    if current_user["user_id"] == user_id:
        raise HTTPException(status_code=403, detail="Cannot delete yourself")
    
    target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    
    await log_activity(
        current_user["user_id"],
        current_user["name"],
        f"Deleted user {target_user['name']}"
    )
    
    return {"message": "User deleted successfully"}

# ==================== LOGIN RECORDS ROUTES ====================

@api_router.get("/login-records")
async def get_login_records(
    request: Request, 
    limit: int = 50, 
    skip: int = 0, 
    user_id: str = None,
    success_only: bool = None
):
    """Get all login records (Super Admin only)"""
    current_user = await get_current_user(request)
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can view login records")
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    if success_only is not None:
        query["success"] = success_only
    
    records = await db.login_records.find(query, {"_id": 0}).sort("login_time", -1).skip(skip).limit(limit).to_list(limit)
    
    for record in records:
        if isinstance(record.get("login_time"), str):
            record["login_time"] = datetime.fromisoformat(record["login_time"])
    
    return records

@api_router.get("/login-records/count")
async def get_login_records_count(request: Request):
    """Get total login records count"""
    current_user = await get_current_user(request)
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can view login records")
    
    total = await db.login_records.count_documents({})
    successful = await db.login_records.count_documents({"success": True})
    failed = await db.login_records.count_documents({"success": False})
    
    return {"total": total, "successful": successful, "failed": failed}

@api_router.get("/login-records/user/{user_id}")
async def get_user_login_records(user_id: str, request: Request, limit: int = 20):
    """Get login records for a specific user"""
    current_user = await get_current_user(request)
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can view login records")
    
    records = await db.login_records.find({"user_id": user_id}, {"_id": 0}).sort("login_time", -1).limit(limit).to_list(limit)
    
    for record in records:
        if isinstance(record.get("login_time"), str):
            record["login_time"] = datetime.fromisoformat(record["login_time"])
    
    return records

@api_router.post("/users/{user_id}/lock-device")
async def lock_user_device(user_id: str, request: Request):
    """Enable device lock for a user and set their current device as allowed"""
    current_user = await get_current_user(request)
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can manage device locks")
    
    target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get the user's most recent successful login to get their device fingerprint
    last_login = await db.login_records.find_one(
        {"user_id": user_id, "success": True},
        {"_id": 0},
        sort=[("login_time", -1)]
    )
    
    if not last_login:
        raise HTTPException(status_code=400, detail="No successful login found for this user")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "device_lock_enabled": True,
            "allowed_device_fingerprint": last_login["device_fingerprint"]
        }}
    )
    
    await log_activity(
        current_user["user_id"],
        current_user["name"],
        f"Enabled device lock for {target_user['name']}",
        details=f"Locked to device: {last_login['device_type']} - {last_login['browser']}"
    )
    
    return {
        "message": "Device lock enabled",
        "locked_device": {
            "device_type": last_login["device_type"],
            "browser": last_login["browser"],
            "device_os": last_login["device_os"]
        }
    }

@api_router.post("/users/{user_id}/unlock-device")
async def unlock_user_device(user_id: str, request: Request):
    """Disable device lock for a user"""
    current_user = await get_current_user(request)
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can manage device locks")
    
    target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "device_lock_enabled": False,
            "allowed_device_fingerprint": None
        }}
    )
    
    await log_activity(
        current_user["user_id"],
        current_user["name"],
        f"Disabled device lock for {target_user['name']}"
    )
    
    return {"message": "Device lock disabled"}

@api_router.post("/users/{user_id}/update-device")
async def update_user_device(user_id: str, request: Request):
    """Update the allowed device for a user to their most recent login"""
    current_user = await get_current_user(request)
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can manage device locks")
    
    target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get the user's most recent login (even if failed due to device lock)
    last_login = await db.login_records.find_one(
        {"user_id": user_id},
        {"_id": 0},
        sort=[("login_time", -1)]
    )
    
    if not last_login:
        raise HTTPException(status_code=400, detail="No login records found for this user")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "allowed_device_fingerprint": last_login["device_fingerprint"]
        }}
    )
    
    await log_activity(
        current_user["user_id"],
        current_user["name"],
        f"Updated allowed device for {target_user['name']}",
        details=f"New device: {last_login['device_type']} - {last_login['browser']}"
    )
    
    return {
        "message": "Allowed device updated",
        "new_device": {
            "device_type": last_login["device_type"],
            "browser": last_login["browser"],
            "device_os": last_login["device_os"]
        }
    }

# ==================== SOURCING REQUESTS ROUTES ====================

@api_router.post("/sourcing-requests")
async def create_sourcing_request(data: SourcingRequestCreate, request: Request):
    user = await get_current_user(request)
    
    if "talent" not in user.get("accessible_units", []) and user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="No access to Talent unit")
    
    request_id = f"src_{uuid.uuid4().hex[:12]}"
    doc = {
        "request_id": request_id,
        "user_id": user["user_id"],
        "job_title": data.job_title,
        "job_description": data.job_description,
        "company_name": data.company_name,
        "company_website": data.company_website,
        "company_location": data.company_location,
        "hiring_locations": data.hiring_locations,
        "salary_budget": data.salary_budget or "",
        "target_companies": data.target_companies or "",
        "companies_to_exclude": data.companies_to_exclude or "",
        "accept_n_minus_one": data.accept_n_minus_one,
        "industry_segments": data.industry_segments or "",
        "additional_notes": data.additional_notes or "",
        "assigned_recruiter": data.assigned_recruiter,
        "requester_email": user["email"],
        "status": "submitted",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.sourcing_requests.insert_one(doc)
    
    # Send to webhook
    webhook_url = await get_webhook_url("sourcing_webhook_url")
    if webhook_url:
        webhook_payload = {
            "Requester Email": user["email"],
            "Job Title": data.job_title,
            "Job Description": data.job_description,
            "Company Name": data.company_name,
            "Company Website": data.company_website,
            "Company Location": data.company_location,
            "Hiring Locations": data.hiring_locations,
            "Salary Budget": data.salary_budget or "",
            "Target Companies to Hire From": data.target_companies or "",
            "Companies to Exclude": data.companies_to_exclude or "",
            "Accept N-Minus-One Candidates": data.accept_n_minus_one,
            "Industry Segments to Include or Exclude": data.industry_segments or "",
            "Additional Notes": data.additional_notes or "",
            "Assigned Recruiter": data.assigned_recruiter
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(webhook_url, json=webhook_payload, timeout=30)
                if response.status_code == 200:
                    await db.sourcing_requests.update_one(
                        {"request_id": request_id},
                        {"$set": {"status": "processing"}}
                    )
        except Exception as e:
            logger.error(f"Webhook call failed: {e}")
    
    await log_activity(
        user["user_id"],
        user["name"],
        f"Submitted sourcing request for '{data.job_title}'",
        unit_slug="talent",
        entity_type="sourcing_request",
        entity_id=request_id,
        details=f"Company: {data.company_name}"
    )
    
    return {"request_id": request_id, "status": "submitted", "message": "Sourcing request submitted successfully"}

@api_router.get("/sourcing-requests", response_model=List[SourcingRequestResponse])
async def get_sourcing_requests(request: Request):
    user = await get_current_user(request)
    
    query = {} if user["role"] in ["super_admin", "mini_admin"] else {"user_id": user["user_id"]}
    requests = await db.sourcing_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for req in requests:
        if isinstance(req.get("created_at"), str):
            req["created_at"] = datetime.fromisoformat(req["created_at"])
    
    return requests

# ==================== DATABASE SEARCH ROUTES ====================

@api_router.post("/database-searches")
async def create_database_search(data: DatabaseSearchCreate, request: Request):
    user = await get_current_user(request)
    
    if "talent" not in user.get("accessible_units", []) and user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="No access to Talent unit")
    
    search_id = f"dbs_{uuid.uuid4().hex[:12]}"
    doc = {
        "search_id": search_id,
        "user_id": user["user_id"],
        "job_title": data.job_title,
        "job_description": data.job_description,
        "company_context": data.company_context or "",
        "seniority_level": data.seniority_level,
        "max_candidates": data.max_candidates,
        "status": "submitted",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.database_searches.insert_one(doc)
    
    # Send to webhook
    webhook_url = await get_webhook_url("database_search_webhook_url")
    if webhook_url:
        webhook_payload = {
            "Job Title": data.job_title,
            "Job Description": data.job_description,
            "Company / Hiring Context": data.company_context or "",
            "Seniority Level": data.seniority_level,
            "Max Candidates to Evaluate": data.max_candidates
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(webhook_url, json=webhook_payload, timeout=30)
                if response.status_code == 200:
                    await db.database_searches.update_one(
                        {"search_id": search_id},
                        {"$set": {"status": "processing"}}
                    )
        except Exception as e:
            logger.error(f"Webhook call failed: {e}")
    
    await log_activity(
        user["user_id"],
        user["name"],
        f"Submitted database search for '{data.job_title}'",
        unit_slug="talent",
        entity_type="database_search",
        entity_id=search_id,
        details=f"Seniority: {data.seniority_level}"
    )
    
    return {"search_id": search_id, "status": "submitted", "message": "Database search initiated successfully"}

@api_router.get("/database-searches", response_model=List[DatabaseSearchResponse])
async def get_database_searches(request: Request):
    user = await get_current_user(request)
    
    query = {} if user["role"] in ["super_admin", "mini_admin"] else {"user_id": user["user_id"]}
    searches = await db.database_searches.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for search in searches:
        if isinstance(search.get("created_at"), str):
            search["created_at"] = datetime.fromisoformat(search["created_at"])
    
    return searches

# ==================== SETTINGS ROUTES ====================

@api_router.get("/settings/webhooks")
async def get_webhooks(request: Request):
    user = await get_current_user(request)
    if user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can access settings")
    
    settings = await db.app_settings.find_one({"setting_type": "webhooks"}, {"_id": 0})
    return settings or {"setting_type": "webhooks", "sourcing_webhook_url": "", "database_search_webhook_url": ""}

@api_router.put("/settings/webhooks")
async def update_webhooks(config: WebhookConfig, request: Request):
    user = await get_current_user(request)
    if user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can access settings")
    
    await db.app_settings.update_one(
        {"setting_type": "webhooks"},
        {"$set": {
            "setting_type": "webhooks",
            "sourcing_webhook_url": config.sourcing_webhook_url or "",
            "database_search_webhook_url": config.database_search_webhook_url or ""
        }},
        upsert=True
    )
    
    await log_activity(user["user_id"], user["name"], "Updated webhook settings")
    
    return {"message": "Webhooks updated successfully"}

@api_router.post("/settings/webhooks/test")
async def test_webhook(request: Request, webhook_type: str, url: str):
    user = await get_current_user(request)
    if user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can test webhooks")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={"test": True, "source": "THCO Portal"}, timeout=10)
            return {"success": response.status_code in [200, 201, 202], "status_code": response.status_code}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ==================== ACTIVITY LOG ROUTES ====================

@api_router.get("/activity-logs")
async def get_activity_logs(request: Request, limit: int = 50, skip: int = 0, user_filter: str = None, unit_filter: str = None):
    user = await get_current_user(request)
    
    query = {}
    if user["role"] == "team_member":
        query["user_id"] = user["user_id"]
    elif user_filter:
        query["user_id"] = user_filter
    
    if unit_filter:
        query["unit_slug"] = unit_filter
    
    logs = await db.activity_logs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for log in logs:
        if isinstance(log.get("created_at"), str):
            log["created_at"] = datetime.fromisoformat(log["created_at"])
    
    return logs

@api_router.get("/activity-logs/count")
async def get_activity_count(request: Request):
    user = await get_current_user(request)
    query = {} if user["role"] != "team_member" else {"user_id": user["user_id"]}
    count = await db.activity_logs.count_documents(query)
    return {"count": count}

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(request: Request):
    user = await get_current_user(request)
    
    # Count accessible tools
    accessible_units = user.get("accessible_units", [])
    if user["role"] == "super_admin":
        accessible_units = ["talent", "sales", "marketing", "advisory", "technology", "operations", "academy", "client-delivery"]
    
    # Currently only talent has active tools (2 tools)
    total_tools = 2 if "talent" in accessible_units else 0
    
    # Pending requests count
    pending_query = {"status": {"$in": ["submitted", "processing"]}}
    if user["role"] == "team_member":
        pending_query["user_id"] = user["user_id"]
    
    pending_sourcing = await db.sourcing_requests.count_documents(pending_query)
    pending_searches = await db.database_searches.count_documents(pending_query)
    
    # Recent activity count
    activity_query = {} if user["role"] != "team_member" else {"user_id": user["user_id"]}
    recent_activity = await db.activity_logs.count_documents(activity_query)
    
    return {
        "total_tools": total_tools,
        "pending_requests": pending_sourcing + pending_searches,
        "recent_activity": recent_activity
    }

# ==================== SEED INITIAL ADMIN ====================

@app.on_event("startup")
async def seed_initial_admin():
    """Seed the initial super admin user if no users exist"""
    user_count = await db.users.count_documents({})
    if user_count == 0:
        all_units = ["talent", "sales", "marketing", "advisory", "technology", "operations", "academy", "client-delivery"]
        admin_doc = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": "joshua@thcohq.com",
            "password_hash": hash_password("THCOAdmin2024!"),
            "name": "Ayo",
            "role": "super_admin",
            "accessible_units": all_units,
            "status": "active",
            "picture": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_doc)
        logger.info("Seeded initial super admin: joshua@thcohq.com")

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

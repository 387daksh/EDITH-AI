"""
Authentication and Role-Based Access Control for EDITH
Roles: ADMIN, EMPLOYEE, HR
"""
import os
import jwt
import json
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, List
from fastapi import HTTPException, Depends, Header
from pydantic import BaseModel

# JWT Configuration
SECRET_KEY = os.environ.get("JWT_SECRET", "edith-secret-key-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# ==================== ROLES ====================
class Role(str, Enum):
    ADMIN = "admin"
    EMPLOYEE = "employee"
    HR = "hr"

# ==================== USER STORAGE ====================
# In-memory storage (replace with database in production)
# Format: {email: {password, role, name, assigned_repos}}

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
ASSIGNMENTS_FILE = os.path.join(DATA_DIR, "repo_assignments.json")

def load_users() -> dict:
    """Load users from JSON file."""
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    # Default users
    return {
        "admin@edith.ai": {"password": "admin123", "role": "admin", "name": "Admin"},
        "employee@edith.ai": {"password": "emp123", "role": "employee", "name": "Demo Employee"},
        "hr@edith.ai": {"password": "hr123", "role": "hr", "name": "HR Manager"},
    }

def save_users(users: dict):
    """Save users to JSON file."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def load_assignments() -> dict:
    """Load repo assignments {email: [repo_names]}."""
    if os.path.exists(ASSIGNMENTS_FILE):
        with open(ASSIGNMENTS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_assignments(assignments: dict):
    """Save repo assignments."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(ASSIGNMENTS_FILE, 'w') as f:
        json.dump(assignments, f, indent=2)

# ==================== TOKEN FUNCTIONS ====================
class TokenData(BaseModel):
    email: str
    role: Role
    name: str
    exp: datetime

def create_token(email: str, role: str, name: str) -> str:
    """Create JWT token."""
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {
        "email": email,
        "role": role,
        "name": name,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== DEPENDENCIES ====================
async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """FastAPI dependency to get current user from token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format. Use 'Bearer <token>'")
    
    token = authorization.split(" ")[1]
    return verify_token(token)

def require_role(*allowed_roles: Role):
    """Dependency factory for role-based access."""
    async def role_checker(user: dict = Depends(get_current_user)):
        user_role = user.get("role")
        if user_role not in [r.value for r in allowed_roles]:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}"
            )
        return user
    return role_checker

def get_assigned_repos(email: str) -> List[str]:
    """Get list of repos assigned to an employee."""
    assignments = load_assignments()
    return assignments.get(email, [])

def assign_repo_to_user(admin_email: str, user_email: str, repo_name: str) -> bool:
    """Admin assigns a repo to an employee."""
    users = load_users()
    if user_email not in users:
        raise HTTPException(status_code=404, detail="User not found")
    if users[user_email]["role"] != "employee":
        raise HTTPException(status_code=400, detail="Can only assign repos to employees")
    
    assignments = load_assignments()
    if user_email not in assignments:
        assignments[user_email] = []
    
    if repo_name not in assignments[user_email]:
        assignments[user_email].append(repo_name)
        save_assignments(assignments)
    
    return True

# ==================== AUTH ENDPOINTS (to be used in main.py) ====================
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    role: str
    name: str
    email: str

def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate user and return user data."""
    users = load_users()
    user = users.get(email)
    if user and user["password"] == password:
        return {"email": email, **user}
    return None

# Initialize default users on module load
if not os.path.exists(USERS_FILE):
    save_users(load_users())

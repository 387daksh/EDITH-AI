from dotenv import load_dotenv
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from backend.ingestion import clone_repo, process_repo, DATA_DIR, REPO_DIR
from backend import hr_processing
from backend.graph import DependencyGraph
from backend.auth import (
    Role, authenticate_user, create_token, get_current_user, 
    require_role, get_assigned_repos, assign_repo_to_user,
    LoginRequest, LoginResponse, load_users, save_users
)
import os

app = FastAPI(title="EDITH Backend")

# Enable CORS for frontend
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== AUTH ENDPOINTS ====================
@app.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Authenticate user and return JWT token."""
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["email"], user["role"], user["name"])
    return LoginResponse(
        token=token,
        role=user["role"],
        name=user["name"],
        email=user["email"]
    )

@app.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    """Get current user info."""
    return {
        "email": user["email"],
        "role": user["role"],
        "name": user["name"]
    }

from backend.hr_advanced import get_performance_stats, get_leave_info, request_leave, get_onboarding_tasks, toggle_onboarding_task

@app.get("/users")
def list_users(user: dict = Depends(require_role(Role.ADMIN, Role.HR, Role.EMPLOYEE))):
    """List all users (Company Directory)."""
    users = load_users()
    return {"users": [
        {
            "email": email, 
            "role": u["role"], 
            "name": u["name"],
            "title": u.get("title", "Employee"),
            "department": u.get("department", "General"),
            "manager_email": u.get("manager_email")
        }
        for email, u in users.items()
    ]}

# --- Advanced HR Endpoints ---

@app.get("/hr/performance")
def get_my_performance(user: dict = Depends(get_current_user)):
    return get_performance_stats(user["email"])

@app.get("/hr/leaves")
def get_my_leaves(user: dict = Depends(get_current_user)):
    return get_leave_info(user["email"])

class LeaveRequest(BaseModel):
    type: str
    start_date: str
    end_date: str
    reason: str

@app.post("/hr/leaves")
def submit_leave(req: LeaveRequest, user: dict = Depends(get_current_user)):
    return request_leave(user["email"], req.type, req.start_date, req.end_date, req.reason)

from backend.hr_advanced import get_all_leave_requests, update_leave_status

@app.get("/hr/all-leaves")
def list_all_leaves(user: dict = Depends(require_role(Role.HR, Role.ADMIN))):
    return get_all_leave_requests()

class LeaveStatusUpdate(BaseModel):
    status: str

@app.post("/hr/leaves/{request_id}/status")
def set_leave_status(request_id: int, update: LeaveStatusUpdate, user: dict = Depends(require_role(Role.HR, Role.ADMIN))):
    success = update_leave_status(request_id, update.status)
    if not success:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return {"status": "updated"}

@app.get("/hr/onboarding")
def get_my_onboarding(user: dict = Depends(get_current_user)):
    return get_onboarding_tasks(user["email"])

@app.post("/hr/onboarding/{task_id}/toggle")
def toggle_task(task_id: int, user: dict = Depends(get_current_user)):
    return toggle_onboarding_task(user["email"], task_id)


class AssignRepoRequest(BaseModel):
    user_email: str
    repo_name: str

@app.post("/assign-repo")
def assign_repo(request: AssignRepoRequest, user: dict = Depends(require_role(Role.ADMIN))):
    """Admin: Assign a repository to an employee."""
    assign_repo_to_user(user["email"], request.user_email, request.repo_name)
    return {"status": "success", "message": f"Assigned {request.repo_name} to {request.user_email}"}

@app.get("/my-repos")
def get_my_repos(user: dict = Depends(get_current_user)):
    """Get repos assigned to current user (employees) or all repos (admin)."""
    if user["role"] == Role.ADMIN.value:
        # Admin sees all repos
        repos_dir = REPO_DIR
        if os.path.exists(repos_dir):
            return {"repos": os.listdir(repos_dir)}
        return {"repos": []}
    else:
        return {"repos": get_assigned_repos(user["email"])}

# ==================== PUBLIC ENDPOINTS ====================
@app.get("/")
def read_root():
    return {"status": "EDITH is online"}

@app.get("/status")
def get_status():
    """Check if data has been ingested."""
    from backend.vector_store import get_collection
    try:
        collection = get_collection()
        count = collection.count()
        return {"ingested": count > 0, "chunks_count": count}
    except:
        return {"ingested": False, "chunks_count": 0}

# ==================== CODE DOMAIN (Admin + Assigned Employees) ====================
class IngestRequest(BaseModel):
    repo_url: str
    force: bool = False

@app.post("/ingest")
def ingest_repo(request: IngestRequest, user: dict = Depends(require_role(Role.ADMIN))):
    """Admin only: Ingest a repository."""
    try:
        from backend.vector_store import get_collection, add_documents
        
        if not request.force:
            try:
                collection = get_collection()
                existing_count = collection.count()
                if existing_count > 0:
                    return {
                        "status": "skipped",
                        "message": f"Already ingested ({existing_count} chunks). Use force=true to re-ingest.",
                        "chunks_count": existing_count
                    }
            except:
                pass
        
        repo_path = clone_repo(request.repo_url)
        documents = process_repo(repo_path)
        add_documents(documents)
        
        # Extract repo name for assignment tracking
        repo_name = request.repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        
        return {
            "status": "success",
            "message": f"Ingested {len(documents)} chunks from {request.repo_url}",
            "chunks_count": len(documents),
            "repo_name": repo_name
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/graph")
def get_graph(user: dict = Depends(get_current_user)):
    """Get dependency graph (Admin or assigned Employee)."""
    graph_path = os.path.join(DATA_DIR, "dependency_graph.gml")
    dg = DependencyGraph()
    if os.path.exists(graph_path):
        dg.load(graph_path)
        return {"mermaid": dg.to_mermaid()}
    return {"mermaid": "graph TD; A[No Graph Found]"}


# ==================== GITDIAGRAM INTEGRATION ====================
from backend.gitdiagram import fetch_gitdiagram, extract_owner_repo

class ArchitectureRequest(BaseModel):
    repo_url: str
    github_pat: Optional[str] = None

@app.post("/graph/architecture")
async def get_architecture_diagram(request: ArchitectureRequest, user: dict = Depends(get_current_user)):
    """
    Get a professional architecture diagram from GitDiagram.
    This calls gitdiagram.com's API to generate a styled Mermaid diagram.
    """
    try:
        owner, repo = extract_owner_repo(request.repo_url)
        mermaid_code = await fetch_gitdiagram(owner, repo, request.github_pat)
        return {"mermaid": mermaid_code, "source": "gitdiagram"}
    except ValueError as e:
        return {"mermaid": f"graph TD\n    A[Invalid URL: {str(e)}]", "source": "error"}
    except Exception as e:
        # Fallback to local graph
        return {"mermaid": f"graph TD\n    A[GitDiagram Error: {str(e)[:50]}]", "source": "error"}


class QueryRequest(BaseModel):
    question: str

@app.post("/query")
def query_repo(request: QueryRequest, user: dict = Depends(get_current_user)):
    """Query codebase (any authenticated user)."""
    try:
        from backend.reasoning import answer_question
        answer = answer_question(request.question)
        return {"answer": answer}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== HR DOMAIN (HR Role Only) ====================
class HRUploadRequest(BaseModel):
    title: str
    content: str

@app.post("/upload-hr-doc")
def upload_hr_doc(request: HRUploadRequest, user: dict = Depends(require_role(Role.HR, Role.ADMIN))):
    """HR/Admin: Upload an HR document."""
    try:
        from backend.hr_context import add_hr_doc
        doc = add_hr_doc(request.title, request.content)
        return {"status": "success", "doc": doc}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class HRAskRequest(BaseModel):
    question: str

@app.post("/ask-hr")
def ask_hr(request: HRAskRequest, user: dict = Depends(require_role(Role.HR, Role.ADMIN))):
    """HR/Admin: Ask an HR question."""
    try:
        from backend.hr_reasoning import ask_hr as hr_ask
        result = hr_ask(request.question)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/hr-docs")
def list_hr_docs(user: dict = Depends(require_role(Role.HR, Role.ADMIN))):
    """HR/Admin: List all HR documents."""
    try:
        from backend.hr_context import list_hr_docs
        docs = list_hr_docs()
        return {"docs": docs}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== RECRUITMENT (HR Role Only) ====================
from typing import Dict, Any, List
from fastapi import File, UploadFile

class ResumeAnalysisRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str

@app.post("/hr/parse-resume")
async def parse_resume(file: UploadFile = File(...), user: dict = Depends(require_role(Role.HR, Role.ADMIN))):
    """HR/Admin: Parse a PDF resume."""
    content = await file.read()
    # Save temp file for pypdf if needed, or pass bytes
    text = hr_processing.extract_text_from_pdf(content)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    
    data = hr_processing.parse_resume_data(text)
    return data

@app.post("/hr/generate-questions")
def generate_questions(request: ResumeAnalysisRequest, user: dict = Depends(require_role(Role.HR, Role.ADMIN))):
    """HR/Admin: Generate interview questions."""
    return hr_processing.generate_interview_questions(request.resume_data, request.job_description)

@app.post("/hr/evaluate")
def evaluate_candidate(request: ResumeAnalysisRequest, user: dict = Depends(require_role(Role.HR, Role.ADMIN))):
    """HR/Admin: Evaluate candidate fit."""
    """HR/Admin: Evaluate candidate fit."""
    return hr_processing.evaluate_candidate(request.resume_data, request.job_description)

# ==================== INNOVATION (PROJECT ORACLE) ====================
from backend.risk_engine import analyze_risk, get_user_history

@app.get("/admin/innovation/risk-radar")
def get_risk_radar(user: dict = Depends(get_current_user)):
    """Admin/HR: Get organizational risk analysis."""
    if user["role"] not in [Role.ADMIN.value, Role.HR.value]:
        raise HTTPException(status_code=403, detail="Access restricted to Admin/HR")
    return analyze_risk()

@app.get("/admin/innovation/history/{username}")
def get_history(username: str, user: dict = Depends(get_current_user)):
    """Admin/HR: Get user commit history."""
    if user["role"] not in [Role.ADMIN.value, Role.HR.value]:
        raise HTTPException(status_code=403, detail="Access restricted")
    return get_user_history(username)

# ==================== ADMIN UNIFIED EDITH CHAT ====================
from backend.hr_reasoning import answer_unified_question

class AdminAskRequest(BaseModel):
    question: str

@app.post("/admin/ask")
def admin_ask(request: AdminAskRequest, user: dict = Depends(get_current_user)):
    """Admin only: Ask EDITH about employees, policies, OR code - unified interface."""
    if user["role"] != Role.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access restricted to Admin")
    return {"answer": answer_unified_question(request.question)}


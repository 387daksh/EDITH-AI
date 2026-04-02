// EDITH Backend API Service with Authentication
// Connects to the FastAPI backend at http://127.0.0.1:8000

const API_BASE = "http://127.0.0.1:8000";

// ==================== AUTH ====================
export type Role = "admin" | "employee" | "hr";

export interface User {
  email: string;
  name: string;
  role: Role;
  token: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
  name: string;
  email: string;
}

// Token storage
let currentUser: User | null = null;

export const getStoredUser = (): User | null => {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem("edith_user");
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
};

export const setUser = (user: User | null) => {
  currentUser = user;
  if (user) {
    localStorage.setItem("edith_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("edith_user");
  }
};

export const isLoggedIn = (): boolean => getStoredUser() !== null;

export const getRole = (): Role | null => getStoredUser()?.role || null;

export const logout = () => setUser(null);

// Auth header helper
const authHeaders = (): HeadersInit => {
  const user = getStoredUser();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (user?.token) {
    headers["Authorization"] = `Bearer ${user.token}`;
  }
  return headers;
};

/**
 * Login to EDITH
 */
export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }
  const data: LoginResponse = await response.json();
  const user: User = {
    email: data.email,
    name: data.name,
    role: data.role,
    token: data.token,
  };
  setUser(user);
  return user;
};

// ==================== PUBLIC ENDPOINTS ====================
export interface StatusResponse {
  ingested: boolean;
  chunks_count: number;
}

export const checkStatus = async (): Promise<StatusResponse> => {
  const response = await fetch(`${API_BASE}/status`);
  if (!response.ok) throw new Error("Failed to check status");
  return response.json();
};

// ==================== CODE DOMAIN (Admin + Employee) ====================
export interface IngestResponse {
  status: string;
  message: string;
  chunks_count: number;
  repo_name?: string;
}

export const ingestRepository = async (
  repoUrl: string,
  force: boolean = false,
): Promise<IngestResponse> => {
  const response = await fetch(`${API_BASE}/ingest`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ repo_url: repoUrl, force }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Ingestion failed");
  }
  return response.json();
};

export const askEdith = async (question: string): Promise<string> => {
  const response = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Query failed");
  }
  const data = await response.json();
  return data.answer;
};

export const getGraph = async (): Promise<string> => {
  const response = await fetch(`${API_BASE}/graph`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load graph");
  const data = await response.json();
  return data.mermaid;
};

// Get professional architecture diagram from GitDiagram
export interface ArchitectureResponse {
  mermaid: string;
  source: 'gitdiagram' | 'local' | 'error';
}

export const getArchitectureDiagram = async (repoUrl: string): Promise<ArchitectureResponse> => {
  const response = await fetch(`${API_BASE}/graph/architecture`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  if (!response.ok) {
    return { mermaid: "graph TD\n    A[Failed to load diagram]", source: 'error' };
  }
  return await response.json();
};

// ==================== HR DOMAIN (HR + Admin) ====================
export interface HRDoc {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface HRAskResponse {
  answer: string;
  intent?: string;
  sources?: string[];
}

export const uploadHRDoc = async (title: string, content: string): Promise<HRDoc> => {
  const response = await fetch(`${API_BASE}/upload-hr-doc`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, content }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload HR document");
  }
  const data = await response.json();
  return data.doc;
};

export const askHR = async (question: string): Promise<HRAskResponse> => {
  const response = await fetch(`${API_BASE}/ask-hr`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to ask HR question");
  }
  return response.json();
};

export const listHRDocs = async (): Promise<HRDoc[]> => {
  const response = await fetch(`${API_BASE}/hr-docs`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to list HR docs");
  const data = await response.json();
  return data.docs;
};

// ==================== ADMIN ENDPOINTS ====================
export interface UserInfo {
  email: string;
  name: string;
  role: Role;
  title?: string;
  department?: string;
  manager_email?: string;
}

export const listUsers = async (): Promise<UserInfo[]> => {
  const response = await fetch(`${API_BASE}/users`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to list users");
  const data = await response.json();
  return data.users;
};

export const assignRepo = async (userEmail: string, repoName: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/assign-repo`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_email: userEmail, repo_name: repoName }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to assign repo");
  }
};

export const getMyRepos = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE}/my-repos`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to get repos");
  const data = await response.json();
  return data.repos;
};

// ==================== DASHBOARD ====================
export interface DashboardStats {
  repositories: number;
  chunks_count: number;
  hr_docs_count: number;
  is_connected: boolean;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const status = await checkStatus().catch(() => ({ ingested: false, chunks_count: 0 }));
    
    // Only try HR docs if user is HR or Admin
    let hrDocsCount = 0;
    const role = getRole();
    if (role === "hr" || role === "admin") {
      try {
        const docs = await listHRDocs();
        hrDocsCount = docs.length;
      } catch {
        // Ignore HR errors for non-HR users
      }
    }
    
    return {
      repositories: status.ingested ? 1 : 0,
      chunks_count: status.chunks_count,
      hr_docs_count: hrDocsCount,
      is_connected: true,
    };
  } catch {
    return {
      repositories: 0,
      chunks_count: 0,
      hr_docs_count: 0,
      is_connected: false,
    };
  }
};

// ==================== RECRUITMENT (HR Role Only) ====================
export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    university: string;
    year: string;
  }>;
  summary?: string;
  [key: string]: any;
}

export interface QuestionSet {
  technical: string[];
  behavioral: string[];
}

export interface Evaluation {
  match_score: number;
  pros: string[];
  cons: string[];
  reasoning: string;
  recommendation: string;
}

export const parseResume = async (file: File): Promise<ResumeData> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const headers = authHeaders() as Record<string, string>;
  // IMPORTANT: Delete Content-Type so browser sets it with the boundary for multipart/form-data
  delete headers["Content-Type"];

  const response = await fetch(`${API_BASE}/hr/parse-resume`, {
    method: "POST",
    headers: headers,
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to parse resume");
  }
  return response.json();
};

export const generateQuestions = async (resume_data: ResumeData, job_description: string): Promise<QuestionSet> => {
  const response = await fetch(`${API_BASE}/hr/generate-questions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ resume_data, job_description }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate questions");
  }
  return response.json();
};

export const evaluateCandidate = async (resume_data: ResumeData, job_description: string): Promise<Evaluation> => {
  const response = await fetch(`${API_BASE}/hr/evaluate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ resume_data, job_description }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to evaluate candidate");
  }
  return response.json();
};

// ==================== ADVANCED HR ====================

export interface PerformanceData {
  overall_score: number;
  trend: number;
  skills: { subject: string; A: number }[];
  metrics: { label: string; val: number }[];
  assessments: { name: string; date: string; status: string; score: string }[];
}

export const getMyPerformance = async (): Promise<PerformanceData> => {
  const response = await fetch(`${API_BASE}/hr/performance`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load performance data");
  return response.json();
};

export interface LeaveInfo {
  balance: { annual: number; sick: number; casual: number };
  requests: {
    id: number;
    type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
  }[];
}

export const getMyLeaves = async (): Promise<LeaveInfo> => {
  const response = await fetch(`${API_BASE}/hr/leaves`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load leave data");
  return response.json();
};

export const submitLeave = async (type: string, start_date: string, end_date: string, reason: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/hr/leaves`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ type, start_date, end_date, reason }),
  });
  if (!response.ok) throw new Error("Failed to submit leave request");
  return response.json();
};

export const getAllLeaves = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/hr/all-leaves`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load all leave requests");
  return response.json();
};

export const updateLeaveStatus = async (requestId: number, status: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/hr/leaves/${requestId}/status`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update leave status");
};

export interface OnboardingTask {
  id: number;
  title: string;
  category: string;
  completed: boolean;
}

export const getOnboardingTasks = async (): Promise<OnboardingTask[]> => {
  const response = await fetch(`${API_BASE}/hr/onboarding`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load onboarding tasks");
  return response.json();
};

export const toggleOnboardingTask = async (taskId: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/hr/onboarding/${taskId}/toggle`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to update task");
};

// ==================== INNOVATION (PROJECT ORACLE) ====================

export interface RiskReportItem {
  module: string;
  path: string;
  complexity: number;
  owner: { email: string; name: string; role: string };
  ownership_percent: number;
  owner_status: string;
  leave_start: string | null;
  risk_score: number;
  risk_label: string;
  action_item: string;
}

export interface RiskReport {
  generated_at: string;
  total_modules: number;
  system_health: number;
  report: RiskReportItem[];
}

export const getRiskRadar = async (): Promise<RiskReport> => {
  const response = await fetch(`${API_BASE}/admin/innovation/risk-radar`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
     const error = await response.json();
     throw new Error(error.detail || "Failed to load risk radar");
  }
  return response.json();
};

export interface Commit {
  hash: string;
  date: string;
  message: string;
}

export const getUserHistory = async (username: string): Promise<Commit[]> => {
  const response = await fetch(`${API_BASE}/admin/innovation/history/${username}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to load user history");
  return response.json();
};

// ==================== ADMIN HR CHAT ====================
export interface AdminAskResponse {
  answer: string;
}

export const askAdminEdith = async (question: string): Promise<string> => {
  const response = await fetch(`${API_BASE}/admin/ask`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get answer");
  }
  const data: AdminAskResponse = await response.json();
  return data.answer;
};

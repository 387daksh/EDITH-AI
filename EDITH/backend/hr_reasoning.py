"""
HR reasoning module.

This module performs intent detection (keyword-based), retrieves HR
context from `hr_context`, and calls the LLM (Groq) to produce a grounded
answer. It enforces that answers are based on uploaded HR documents and
returns a structured response.

ENHANCED: Now includes employee data tools for admin queries.
"""
import os
import re
import json
from typing import List, Dict, Any
from backend import hr_context
from backend.hr_advanced import get_all_leave_requests, get_leave_info, get_performance_stats

try:
    from groq import Groq
    _GROQ_AVAILABLE = True
except Exception:
    _GROQ_AVAILABLE = False

# Initialize Groq client if possible. Keep errors local so module import
# doesn't fail if Groq isn't installed during tests.
_groq_client = None
if _GROQ_AVAILABLE:
    try:
        _groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    except Exception:
        _groq_client = None

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

# ==================== EMPLOYEE DATA TOOLS ====================

def get_all_employees():
    """Returns a list of all employees with their basic info."""
    users = load_users()
    result = []
    for email, data in users.items():
        result.append({
            "email": email,
            "name": data.get("name"),
            "title": data.get("title"),
            "department": data.get("department"),
            "role": data.get("role"),
            "manager": data.get("manager_email")
        })
    return json.dumps(result, indent=2)

def get_employee(name_or_email: str):
    """Get detailed info about a specific employee by name or email."""
    users = load_users()
    name_lower = name_or_email.lower()
    
    for email, data in users.items():
        if name_lower in email.lower() or name_lower == data.get("name", "").lower():
            return json.dumps({
                "email": email,
                "name": data.get("name"),
                "title": data.get("title"),
                "department": data.get("department"),
                "role": data.get("role"),
                "manager": data.get("manager_email")
            }, indent=2)
    return f"Employee '{name_or_email}' not found."

def get_leaves(name_or_email: str):
    """Get leave balance and history for an employee."""
    users = load_users()
    name_lower = name_or_email.lower()
    
    target_email = None
    for email, data in users.items():
        if name_lower in email.lower() or name_lower == data.get("name", "").lower():
            target_email = email
            break
    
    if not target_email:
        return f"Employee '{name_or_email}' not found."
    
    leave_info = get_leave_info(target_email)
    return json.dumps({
        "employee": target_email,
        "balance": leave_info.get("balance"),
        "requests": leave_info.get("requests", [])
    }, indent=2)

def get_performance(name_or_email: str):
    """Get performance metrics for an employee."""
    users = load_users()
    name_lower = name_or_email.lower()
    
    target_email = None
    for email, data in users.items():
        if name_lower in email.lower() or name_lower == data.get("name", "").lower():
            target_email = email
            break
    
    if not target_email:
        return f"Employee '{name_or_email}' not found."
    
    perf = get_performance_stats(target_email)
    return json.dumps({
        "employee": target_email,
        "overall_score": perf.get("overall_score"),
        "trend": perf.get("trend"),
        "skills": perf.get("skills"),
        "metrics": perf.get("metrics")
    }, indent=2)

def get_pending_leaves():
    """Get all pending leave requests."""
    all_requests = get_all_leave_requests()
    pending = [r for r in all_requests if r.get("status") == "Pending"]
    return json.dumps(pending, indent=2) if pending else "No pending leave requests."

def get_org_structure():
    """Get the organizational hierarchy."""
    users = load_users()
    org = {}
    for email, data in users.items():
        manager = data.get("manager_email")
        if manager not in org:
            org[manager] = []
        org[manager].append({
            "email": email,
            "name": data.get("name"),
            "title": data.get("title")
        })
    return json.dumps(org, indent=2)

def get_team_members(manager_name_or_email: str):
    """Get all direct reports of a manager."""
    users = load_users()
    name_lower = manager_name_or_email.lower()
    
    manager_email = None
    for email, data in users.items():
        if name_lower in email.lower() or name_lower == data.get("name", "").lower():
            manager_email = email
            break
    
    if not manager_email:
        return f"Manager '{manager_name_or_email}' not found."
    
    reports = []
    for email, data in users.items():
        if data.get("manager_email") == manager_email:
            reports.append({
                "email": email,
                "name": data.get("name"),
                "title": data.get("title")
            })
    
    if not reports:
        return f"{manager_name_or_email} has no direct reports."
    return json.dumps(reports, indent=2)

# ==================== ORIGINAL HR DOC LOGIC ====================

HR_SYSTEM_PROMPT = """You are EDITH-HR, a precise HR assistant. Only answer using
the provided HR CONTEXT. Do NOT hallucinate or guess. If the information
is missing from the provided CONTEXT, say: "not enough HR information uploaded yet".

Be concise and cite the source titles from the CONTEXT when relevant.

CONTEXT:
{context}

QUESTION:
{question}
"""

# Admin agent prompt for employee queries
ADMIN_SYSTEM_PROMPT = """You are EDITH, an AI HR Assistant for administrators.
You can answer questions about employees, their performance, leaves, and organizational structure.

TOOLS:
- get_all_employees(): List all employees with basic info.
- get_employee(name): Get details about a specific employee.
- get_leaves(name): Get leave balance and history.
- get_performance(name): Get performance metrics and scores.
- get_pending_leaves(): Get all pending leave requests.
- get_org_structure(): Get the full org hierarchy.
- get_team_members(manager): Get direct reports of a manager.

RULES:
1. Use a tool FIRST before answering any employee-specific question.
2. Be concise and professional.
3. If you need to check multiple employees, make multiple tool calls.

FORMAT:
Thought: <reasoning>
Action: [tool_name: argument]

After observations:
Final Answer: <clear, professional answer>
"""


def classify_intent(question: str) -> str:
    """Simple keyword-based intent classification for HR domain.

    Returns one of: 'policy', 'payroll', 'leave', 'hiring', 'culture', 'sop', 'other'
    """
    q = question.lower()
    if any(w in q for w in ["policy", "policies", "policy" , "handbook", "rules"]):
        return "policy"
    if any(w in q for w in ["salary", "payroll", "compensation", "pay"]):
        return "payroll"
    if any(w in q for w in ["leave", "vacation", "pto", "time off", "sick"]):
        return "leave"
    if any(w in q for w in ["hire", "hiring", "recruit", "onboard", "interview"]):
        return "hiring"
    if any(w in q for w in ["culture", "values", "behavior", "ethic", "diversity"]):
        return "culture"
    if any(w in q for w in ["sop", "procedure", "process", "how to", "steps"]):
        return "sop"
    return "other"


def _build_context_text(docs: List[Dict[str, Any]]) -> str:
    parts = []
    total_len = 0
    MAX_CHARS = 6000 # Approx 1500 tokens
    
    for d in docs:
        title = d.get("title", "Untitled")
        content = d.get("content", "")
        # Compact whitespace
        content = " ".join(content.split())
        
        entry = f"--- SOURCE: {title} ---\n{content}\n"
        
        if total_len + len(entry) > MAX_CHARS:
            remaining = MAX_CHARS - total_len
            if remaining > 200:
                parts.append(entry[:remaining] + "... (truncated)")
            break
            
        parts.append(entry)
        total_len += len(entry)
        
    return "\n".join(parts)


def ask_hr(question: str, top_k: int = 3) -> Dict[str, Any]:
    """
    Main entry for HR reasoning (document-based).

    Steps:
      1. Classify intent (best-effort).
      2. Retrieve top-k HR docs from hr_context.
      3. If no useful context, return a refusal indicating not enough info.
      4. Otherwise, call LLM (Groq) with grounded prompt and return structured answer.

    Returns: {answer, sources: [titles], confidence}
    """
    if not question or not question.strip():
        return {"answer": "Please provide a question.", "sources": [], "confidence": "low"}

    intent = classify_intent(question)

    # Retrieve top-k documents
    docs = hr_context.retrieve_top_k(question, k=top_k)

    if not docs or len(docs) == 0:
        # No helpful HR context available
        return {
            "answer": "not enough HR information uploaded yet",
            "sources": [],
            "confidence": "low",
        }

    context_text = _build_context_text(docs)

    # Grounded prompt
    prompt = HR_SYSTEM_PROMPT.format(context=context_text, question=question)

    # If Groq client is available, call it. Otherwise, fail gracefully with a helpful message.
    if _groq_client is None:
        # For environments without Groq configured, return a simple best-effort answer
        # by echoing relevant lines from the top docs. This avoids hallucination.
        snippet = docs[0].get("content", "")[:800]
        answer = f"Based on the uploaded HR docs (see sources), here is an excerpt:\n\n{snippet}"
        sources = [d.get("title", "Untitled") for d in docs]
        return {"answer": answer, "sources": sources, "confidence": "medium"}

    try:
        chat_completion = _groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0,
        )
        content = chat_completion.choices[0].message.content
        sources = [d.get("title", "Untitled") for d in docs]
        # Heuristic confidence: if docs found, high
        return {"answer": content, "sources": sources, "confidence": "high"}
    except Exception as e:
        return {"answer": f"Error calling LLM: {str(e)}", "sources": [d.get("title", "Untitled") for d in docs], "confidence": "low"}


# ==================== NEW: ADMIN AGENT FOR EMPLOYEE QUERIES ====================

def answer_admin_question(question: str) -> str:
    """
    Process an admin HR question using the ReAct agent pattern.
    This handles employee-specific queries like leaves, performance, org structure.
    """
    if _groq_client is None:
        return "LLM not configured. Please set GROQ_API_KEY."
    
    messages = [
        {"role": "system", "content": ADMIN_SYSTEM_PROMPT},
        {"role": "user", "content": question}
    ]
    
    steps = 0
    max_steps = 8
    
    while steps < max_steps:
        try:
            chat = _groq_client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                temperature=0,
                stop=["Observation:"]
            )
        except Exception as e:
            return f"LLM Error: {e}"
        
        response_text = chat.choices[0].message.content.strip()
        messages.append({"role": "assistant", "content": response_text})
        
        # Check for final answer
        if "Final Answer:" in response_text:
            return response_text.split("Final Answer:")[-1].strip()
        
        # Parse action
        action_match = re.search(r"Action:\s*\[?(\w+)[:]?\s*(.*?)\]?$", response_text, re.MULTILINE)
        if action_match:
            tool = action_match.group(1).strip()
            arg = action_match.group(2).strip().strip(']').strip('"\'')
            
            print(f"🧑‍💼 HR Step {steps+1}: {tool}('{arg}')", flush=True)
            
            # Execute tool
            observation = "Unknown tool."
            if tool == "get_all_employees":
                observation = get_all_employees()
            elif tool == "get_employee":
                observation = get_employee(arg)
            elif tool == "get_leaves":
                observation = get_leaves(arg)
            elif tool == "get_performance":
                observation = get_performance(arg)
            elif tool == "get_pending_leaves":
                observation = get_pending_leaves()
            elif tool == "get_org_structure":
                observation = get_org_structure()
            elif tool == "get_team_members":
                observation = get_team_members(arg)
            
            messages.append({"role": "user", "content": f"Observation: {observation}"})
            
            # Trim history
            if len(messages) > 10:
                messages = [messages[0]] + messages[-8:]
        else:
            messages.append({"role": "user", "content": "Please provide 'Final Answer:' now."})
        
        steps += 1
    
    return f"I was unable to fully answer your question. Here's what I found:\n\n{response_text}"


# ==================== UNIFIED EDITH: ALL CAPABILITIES IN ONE ====================

UNIFIED_SYSTEM_PROMPT = """You are EDITH, an AI assistant that answers questions using ONLY data from tool observations.

AVAILABLE TOOLS:
- get_all_employees: List all employees
- get_employee: Get details about one employee (pass just the name, e.g., "Daksh")
- get_leaves: Get leave info for an employee (pass just the name)
- get_performance: Get performance score (pass just the name)
- get_pending_leaves: Get all pending leave requests
- get_org_structure: Get org hierarchy
- get_team_members: Get direct reports (pass manager name)
- search_policies: Search HR policies
- analyze_code: Analyze codebase

CRITICAL RULES:
1. You MUST call a tool before giving any answer.
2. ONLY use names, numbers, and facts that appear in the Observation.
3. NEVER invent or hallucinate names like "Bob", "Alice", "John" - only use real employee names from observations.
4. Extract the EXACT values from the JSON in observations.

FORMAT:
Thought: I need to get X
Action: [tool_name: argument]

After Observation:
Final Answer: <answer using ONLY data from observation>

EXAMPLE (Correct):
User: Who has the best performance?
Thought: I need to check all performances
Action: [get_all_employees]

Observation: [{"name": "Daksh"}, {"name": "Syna"}, ...]

Thought: Now I'll check each person's score
Action: [get_performance: Daksh]

Observation: {"overall_score": 91.2, ...}

Final Answer: Based on my analysis, Daksh has a score of 91.2.

REMEMBER: Only use names and numbers you actually see in observations!
"""


def search_policies(query: str) -> str:
    """Search HR policies and documents."""
    docs = hr_context.retrieve_top_k(query, k=3)
    if not docs:
        return "No relevant policy documents found."
    
    result = []
    for d in docs[:3]:
        title = d.get("title", "Untitled")
        content = d.get("content", "")[:500]
        result.append(f"📄 {title}:\n{content}")
    return "\n\n".join(result)


def analyze_code(question: str) -> str:
    """Route to code reasoning engine."""
    try:
        from backend.reasoning import answer_question
        return answer_question(question)
    except Exception as e:
        return f"Code analysis error: {e}"


def answer_unified_question(question: str) -> str:
    """
    Unified EDITH that handles ALL types of questions:
    - Employee data (leaves, performance, org structure)
    - HR policies and documents
    - Codebase analysis
    """
    if _groq_client is None:
        return "LLM not configured. Please set GROQ_API_KEY."
    
    messages = [
        {"role": "system", "content": UNIFIED_SYSTEM_PROMPT},
        {"role": "user", "content": question}
    ]
    
    steps = 0
    max_steps = 10
    tool_called = False  # Track if any tool was ever called
    
    while steps < max_steps:
        try:
            chat = _groq_client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                temperature=0,
                stop=["Observation:"]
            )
        except Exception as e:
            return f"LLM Error: {e}"
        
        response_text = chat.choices[0].message.content.strip()
        messages.append({"role": "assistant", "content": response_text})
        
        print(f"🤖 EDITH Response: {response_text[:200]}...", flush=True)
        
        # Check for final answer - but ONLY if we called a tool
        if "Final Answer:" in response_text:
            if tool_called:
                return response_text.split("Final Answer:")[-1].strip()
            else:
                # Force tool use - don't allow immediate final answer
                messages.append({"role": "user", "content": "You must call a tool first before providing a Final Answer. Use get_all_employees, get_employee, get_performance, or another tool."})
                steps += 1
                continue
        
        # Parse action - extract tool name and argument from various LLM formats
        # Match patterns like: [tool()], [tool: arg], [tool(name="arg")], tool(arg), etc.
        action_match = re.search(r"Action:\s*\[?(\w+)\s*[\(:]?\s*(.*?)[\)\]]?(?:\s*$|\s*\n)", response_text, re.MULTILINE | re.IGNORECASE)
        
        if action_match:
            tool = action_match.group(1).strip()
            raw_arg = action_match.group(2).strip() if action_match.lastindex >= 2 else ""
            
            # Clean the argument thoroughly
            # Remove: (), [], name=, quotes, whitespace
            arg = raw_arg
            arg = re.sub(r'^\(+', '', arg)  # Remove leading (
            arg = re.sub(r'\)+$', '', arg)  # Remove trailing )
            arg = re.sub(r'^\[+', '', arg)  # Remove leading [
            arg = re.sub(r'\]+$', '', arg)  # Remove trailing ]
            arg = re.sub(r'^name\s*=\s*', '', arg, flags=re.IGNORECASE)  # Remove name=
            arg = re.sub(r'^["\']|["\']$', '', arg.strip())  # Remove quotes
            arg = arg.strip()
            
            # If arg is empty or just "()", treat as no argument
            if arg in ['', '()', '[]', 'None', 'none']:
                arg = ''
            
            print(f"🤖 EDITH Step {steps+1}: {tool}('{arg}')", flush=True)
            
            # Execute tool based on category
            observation = "Unknown tool. Available tools: get_all_employees, get_employee, get_leaves, get_performance, get_pending_leaves, get_org_structure, get_team_members, search_policies, analyze_code"

            
            # Employee tools
            if tool == "get_all_employees":
                observation = get_all_employees()
                tool_called = True
            elif tool == "get_employee":
                observation = get_employee(arg)
                tool_called = True
            elif tool == "get_leaves":
                observation = get_leaves(arg)
                tool_called = True
            elif tool == "get_performance":
                observation = get_performance(arg)
                tool_called = True
            elif tool == "get_pending_leaves":
                observation = get_pending_leaves()
                tool_called = True
            elif tool == "get_org_structure":
                observation = get_org_structure()
                tool_called = True
            elif tool == "get_team_members":
                observation = get_team_members(arg)
                tool_called = True
            # Policy tools
            elif tool == "search_policies":
                observation = search_policies(arg)
                tool_called = True
            # Code tools
            elif tool == "analyze_code":
                observation = analyze_code(arg)
                tool_called = True
            
            print(f"🤖 Observation (first 300 chars): {observation[:300]}", flush=True)
            messages.append({"role": "user", "content": f"Observation: {observation}"})
            
            # Trim history
            if len(messages) > 12:
                messages = [messages[0]] + messages[-10:]
        else:
            # Failed to parse action, prompt for correction
            messages.append({"role": "user", "content": "Please format your response correctly with 'Action: [tool_name: argument]' or 'Final Answer: <answer>'"})
        
        steps += 1
    
    return f"Here's what I found:\n\n{response_text}"




from datetime import datetime, timedelta
import json
import os
import random

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
LEAVES_FILE = os.path.join(DATA_DIR, "leaves.json")
PERFORMANCE_FILE = os.path.join(DATA_DIR, "performance.json")

# --- Helpers ---
def load_json(filepath, default):
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return default

def save_json(filepath, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

# --- Performance ---
def get_performance_stats(email: str):
    data = load_json(PERFORMANCE_FILE, {})
    user_data = data.get(email)

    if not user_data:
        # Generate mock data for new users/first time load
        user_data = {
            "overall_score": round(random.uniform(85, 98), 1),
            "trend": round(random.uniform(1.0, 5.0), 1),
            "skills": [
                {"subject": "Coding", "A": random.randint(70, 95)},
                {"subject": "Design", "A": random.randint(60, 90)},
                {"subject": "Comms", "A": random.randint(75, 95)},
                {"subject": "Leadership", "A": random.randint(65, 90)},
                {"subject": "Speed", "A": random.randint(80, 98)},
                {"subject": "Debug", "A": random.randint(70, 99)},
            ],
            "metrics": [
                {"label": "Code Quality", "val": random.randint(80, 99)},
                {"label": "Collaboration", "val": random.randint(75, 95)},
                {"label": "Velocity", "val": random.randint(70, 90)},
                {"label": "Compliance", "val": 100},
            ],
            "assessments": [
                {"name": "Security Awareness", "date": "2024-01-15", "status": "Passed", "score": "100/100"},
                {"name": "Cloud Architecture", "date": "2024-02-10", "status": "Passed", "score": "92/100"},
                {"name": "Team Leadership", "date": "In Progress", "status": "Active", "score": "--/100"},
            ]
        }
        # Save generated data so it persists
        data[email] = user_data
        save_json(PERFORMANCE_FILE, data)
    
    return user_data

# --- Leave Management ---
DEFAULT_BALANCE = {
    "annual": 20,
    "sick": 10,
    "casual": 5
}

def get_leave_info(email: str):
    data = load_json(LEAVES_FILE, {"balances": {}, "requests": []})
    
    # Initialize balance if not exists
    if email not in data["balances"]:
        data["balances"][email] = DEFAULT_BALANCE.copy()
        save_json(LEAVES_FILE, data)
    
    # Get user requests
    my_requests = [r for r in data["requests"] if r["email"] == email]
    
    return {
        "balance": data["balances"][email],
        "requests": my_requests
    }

def request_leave(email: str, leave_type: str, start_date: str, end_date: str, reason: str):
    data = load_json(LEAVES_FILE, {"balances": {}, "requests": []})
    
    # Simple validation/deduction logic could go here
    # For now, just record the request
    
    new_request = {
        "id": len(data["requests"]) + 1,
        "email": email,
        "type": leave_type,
        "start_date": start_date,
        "end_date": end_date,
        "reason": reason,
        "status": "Pending",
        "applied_on": datetime.now().strftime("%Y-%m-%d")
    }
    
    data["requests"].insert(0, new_request) # Add to top
    save_json(LEAVES_FILE, data)
    data["requests"].insert(0, new_request) # Add to top
    save_json(LEAVES_FILE, data)
    return new_request

def get_all_leave_requests():
    data = load_json(LEAVES_FILE, {"balances": {}, "requests": []})
    return data["requests"]

def update_leave_status(request_id: int, status: str):
    data = load_json(LEAVES_FILE, {"balances": {}, "requests": []})
    updated = False
    for req in data["requests"]:
        if req["id"] == request_id:
            req["status"] = status
            updated = True
            
            # If approved, deduct balance
            if status == 'Approved':
                email = req["email"]
                leave_type = req["type"].lower() # annual, sick, casual
                
                # Map to balance keys if needed, assuming direct mapping for now
                # In a real app we'd need better mapping safely
                if email in data["balances"]:
                    if leave_type in data["balances"][email]:
                         data["balances"][email][leave_type] -= 1 # Simple 1 day deduction for demo
            break
            
    if updated:
        save_json(LEAVES_FILE, data)
        return True
    return False

# --- Onboarding ---
ONBOARDING_FILE = os.path.join(DATA_DIR, "onboarding.json")

DEFAULT_TASKS = [
    {"id": 1, "title": "Sign Employment Contract", "category": "Legal", "completed": False},
    {"id": 2, "title": "Setup Company Email", "category": "IT", "completed": True},
    {"id": 3, "title": "Join Slack Channels", "category": "IT", "completed": True},
    {"id": 4, "title": "Meet the Team", "category": "Social", "completed": False},
    {"id": 5, "title": "Setup Payroll Info", "category": "Finance", "completed": False},
    {"id": 6, "title": "Read Employee Handbook", "category": "Compliance", "completed": False},
]

def get_onboarding_tasks(email: str):
    data = load_json(ONBOARDING_FILE, {})
    if email not in data:
        # Use deep copy of tasks to avoid reference issues
        data[email] = [t.copy() for t in DEFAULT_TASKS]
        save_json(ONBOARDING_FILE, data)
    return data[email]

def toggle_onboarding_task(email: str, task_id: int):
    data = load_json(ONBOARDING_FILE, {})
    if email in data:
        for task in data[email]:
            if task["id"] == task_id:
                task["completed"] = not task["completed"]
                break
        save_json(ONBOARDING_FILE, data)
        return data[email]
    return []

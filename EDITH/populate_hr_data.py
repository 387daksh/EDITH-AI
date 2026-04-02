import json
import os
import random

LEAVES_FILE = 'data/leaves.json'
PERFORMANCE_FILE = 'data/performance.json'
ONBOARDING_FILE = 'data/onboarding.json'
USERS_FILE = 'data/users.json'

def load_json(filepath, default):
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return default

def save_json(filepath, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def generate_performance(user):
    role = user['role']
    name = user['name']
    
    # Base scores on role
    if role == 'admin': # Executives
        score = random.uniform(92, 99)
        skills = [
            {"subject": "Strategy", "A": random.randint(90, 100)},
            {"subject": "Leadership", "A": random.randint(90, 99)},
            {"subject": "Vision", "A": random.randint(85, 98)},
            {"subject": "Execution", "A": random.randint(88, 97)},
            {"subject": "Communication", "A": random.randint(92, 99)},
            {"subject": "Innovation", "A": random.randint(85, 95)},
        ]
    elif 'Manager' in user['title'] or 'Head' in user['title']:
        score = random.uniform(88, 96)
        skills = [
            {"subject": "Management", "A": random.randint(85, 95)},
            {"subject": "Planning", "A": random.randint(80, 92)},
            {"subject": "Hiring", "A": random.randint(75, 90)},
            {"subject": "Delivery", "A": random.randint(85, 95)},
            {"subject": "Mentorship", "A": random.randint(80, 95)},
            {"subject": "Technical", "A": random.randint(70, 90)},
        ]
    elif role == 'hr':
        score = random.uniform(85, 95)
        skills = [
            {"subject": "Empathy", "A": random.randint(90, 99)},
            {"subject": "Compliance", "A": random.randint(88, 98)},
            {"subject": "Recruiting", "A": random.randint(85, 95)},
            {"subject": "Conflict Res", "A": random.randint(80, 92)},
            {"subject": "Culture", "A": random.randint(85, 95)},
            {"subject": "Ops", "A": random.randint(75, 90)},
        ]
    else: # Developers/Engineers
        score = random.uniform(80, 94)
        skills = [
            {"subject": "Coding", "A": random.randint(80, 98)},
            {"subject": "System Design", "A": random.randint(70, 92)},
            {"subject": "Debugging", "A": random.randint(85, 99)},
            {"subject": "Collaboration", "A": random.randint(75, 90)},
            {"subject": "Speed", "A": random.randint(70, 95)},
            {"subject": "Testing", "A": random.randint(65, 90)},
        ]

    return {
        "overall_score": round(score, 1),
        "trend": round(random.uniform(-1.0, 3.0), 1),
        "skills": skills,
        "metrics": [
            {"label": "Impact", "val": random.randint(70, 100)},
            {"label": "Collaboration", "val": random.randint(70, 95)},
            {"label": "Efficiency", "val": random.randint(70, 95)},
            {"label": "Growth", "val": random.randint(60, 100)},
        ],
        "assessments": [
            {"name": "Q1 Review", "date": "2024-03-15", "status": "Completed", "score": f"{random.randint(85, 98)}/100"},
            {"name": "Security Training", "date": "2024-01-20", "status": "Passed", "score": "100/100"},
            {"name": "Q2 Goals", "date": "In Progress", "status": "Active", "score": "--/100"},
        ]
    }

def main():
    users = load_json(USERS_FILE, {})
    
    perf_data = {}
    leaves_data = {"balances": {}, "requests": []}
    onboarding_data = {}
    
    onboarding_tasks_template = [
        {"id": 1, "title": "Sign Employment Contract", "category": "Legal", "completed": True},
        {"id": 2, "title": "Setup Company Email", "category": "IT", "completed": True},
        {"id": 3, "title": "Join Slack Channels", "category": "IT", "completed": True},
        {"id": 4, "title": "Meet the Team", "category": "Social", "completed": True},
        {"id": 5, "title": "Setup Payroll Info", "category": "Finance", "completed": True},
        {"id": 6, "title": "Read Employee Handbook", "category": "Compliance", "completed": True},
    ]

    print(f"Generating data for {len(users)} users...")

    for email, user in users.items():
        # Performance
        perf_data[email] = generate_performance(user)
        
        # Leaves
        leaves_data["balances"][email] = {
            "annual": random.randint(10, 25),
            "sick": random.randint(5, 10),
            "casual": random.randint(2, 5)
        }
        
        # Onboarding - Randomize completion for demo
        user_tasks = [t.copy() for t in onboarding_tasks_template]
        
        # Make newer employees have incomplete tasks
        if user['name'] in ['Jai', 'Kritika', 'Himank']:
             user_tasks[4]['completed'] = False
             user_tasks[5]['completed'] = False
             
        onboarding_data[email] = user_tasks

    save_json(PERFORMANCE_FILE, perf_data)
    save_json(LEAVES_FILE, leaves_data)
    save_json(ONBOARDING_FILE, onboarding_data)
    
    print("✅ Data populated successfully!")

if __name__ == "__main__":
    main()

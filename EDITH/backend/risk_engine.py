import os
import subprocess
from datetime import datetime, timedelta
import json

# Configuration
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_PATH = PROJECT_ROOT
IGNORED_DIRS = {'.git', 'venv', 'node_modules', '__pycache__', 'dist', 'build', '.vscode', '.idea'}
IGNORED_EXTENSIONS = {'.json', '.md', '.txt', '.lock', '.log', '.png', '.jpg', '.svg', '.pyc'}

def get_git_files():
    """Retrieves all tracked files from git."""
    try:
        cmd = ["git", "ls-files"]
        result = subprocess.run(cmd, cwd=REPO_PATH, capture_output=True, text=True, check=True)
        files = result.stdout.splitlines()
        return [f for f in files if not any(d in f for d in IGNORED_DIRS) and not any(f.endswith(ext) for ext in IGNORED_EXTENSIONS)]
    except subprocess.CalledProcessError:
        return []

def get_file_stats(filepath):
    """Calculates complexity (lines of code) and fetches ownership info."""
    try:
        # Get Line Count (Complexity Proxy)
        abs_path = os.path.join(REPO_PATH, filepath)
        with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = len(f.readlines())
        
        complexity = min(round(lines / 50), 10) # Normalize 0-10 (500 lines = max complexity)
        if complexity == 0: complexity = 1

        # Get Commit/Author Info
        cmd = ["git", "shortlog", "-s", "-n", "--", filepath]
        result = subprocess.run(cmd, cwd=REPO_PATH, capture_output=True, text=True)
        
        authors = []
        total_commits = 0
        
        for line in result.stdout.splitlines():
            parts = line.strip().split('\t')
            if len(parts) == 2:
                count = int(parts[0])
                name = parts[1]
                authors.append({"name": name, "count": count})
                total_commits += count
        
        if not authors:
            return None

        primary_owner = authors[0]
        ownership_percent = int((primary_owner["count"] / total_commits) * 100) if total_commits > 0 else 0
        
        return {
            "complexity": complexity,
            "lines": lines,
            "owner": primary_owner["name"],
            "ownership_percent": ownership_percent,
            "authors": authors
        }

    except Exception as e:
        print(f"Error analyzing {filepath}: {e}")
        return None

def analyze_risk():
    """
    Analyzes the codebase for risk using Git history and file complexity.
    """
    files = get_git_files()
    if not files:
        return {"error": "No files found or not a git repository."}

    risk_report = []
    
    # Analyze top 30 largest/most complex files to save time
    # In prod, this would be async/cached
    analyzed_count = 0
    
    for file in files:
        if analyzed_count > 50: break # Limit for performance
        
        stats = get_file_stats(file)
        if not stats: continue
        
        analyzed_count += 1
        
        # Risk Logic
        risk_score = stats["complexity"] * 5
        
        # Bus Factor Risk
        if stats["ownership_percent"] > 80:
            risk_score += 20
        if stats["ownership_percent"] > 90:
            risk_score += 15
            
        # Recent Churn Risk (Mocking this part for now as it requires more complex git log parsing)
        # In a real scenario, check if the file was modified heavily recently
        
        # Normalize Risk
        risk_score = min(risk_score, 100)
        
        if risk_score > 80:
            risk_label = "CRITICAL"
            action_item = f"Reduce dependency on {stats['owner']}"
        elif risk_score > 50:
            risk_label = "WARNING"
            action_item = "Conduct Code Review"
        else:
            risk_label = "STABLE"
            action_item = "Monitor"

        risk_report.append({
            "module": os.path.basename(file),
            "path": file,
            "complexity": stats["complexity"],
            "owner": {"name": stats["owner"]}, # Frontend expects object
            "ownership_percent": stats["ownership_percent"],
            "owner_status": "Active", # Placeholder for HR data integration
            "leave_start": None,
            "risk_score": risk_score,
            "risk_label": risk_label,
            "action_item": action_item
        })

    # Sort by risk
    risk_report.sort(key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "generated_at": datetime.now().strftime("%H:%M:%S"),
        "total_modules": len(files),
        "system_health": int(100 - (sum(r["risk_score"] for r in risk_report) / max(len(risk_report), 1))),
        "report": risk_report
    }

if __name__ == "__main__":
    print(json.dumps(analyze_risk(), indent=2))

def get_user_history(username):
    """
    Fetches git commit history for a specific user.
    """
    try:
        # Get commit log for author
        # Format: Hash|Date|Message
        cmd = ["git", "log", f"--author={username}", "--pretty=format:%h|%ad|%s", "--date=short", "-n", "20"]
        result = subprocess.run(cmd, cwd=REPO_PATH, capture_output=True, text=True)
        
        history = []
        for line in result.stdout.splitlines():
            parts = line.split('|', 2)
            if len(parts) == 3:
                history.append({
                    "hash": parts[0],
                    "date": parts[1],
                    "message": parts[2]
                })
        
        return history

    except Exception as e:
        print(f"Error fetching history for {username}: {e}")
        return []

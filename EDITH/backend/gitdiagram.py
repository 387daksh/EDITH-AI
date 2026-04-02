"""
GitDiagram Integration
Fetches architecture diagrams from gitdiagram.com with caching
"""
import httpx
import json
import re
import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional

GITDIAGRAM_API = "https://api.gitdiagram.com"  # Their backend API

# Cache directory
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "diagram_cache")
CACHE_EXPIRY_DAYS = 7  # Cache diagrams for 7 days


def _get_cache_path(owner: str, repo: str) -> str:
    """Get the cache file path for a given repo."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_key = hashlib.md5(f"{owner}/{repo}".lower().encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{cache_key}.json")


def _get_cached_diagram(owner: str, repo: str) -> Optional[str]:
    """Get cached diagram if it exists and is not expired."""
    cache_path = _get_cache_path(owner, repo)
    if not os.path.exists(cache_path):
        return None
    
    try:
        with open(cache_path, "r", encoding="utf-8") as f:
            cache_data = json.load(f)
        
        # Check expiry
        cached_at = datetime.fromisoformat(cache_data["cached_at"])
        if datetime.now() - cached_at > timedelta(days=CACHE_EXPIRY_DAYS):
            os.remove(cache_path)  # Remove expired cache
            return None
        
        print(f"📦 Using cached diagram for {owner}/{repo}", flush=True)
        return cache_data["mermaid"]
    except Exception:
        return None


def _save_to_cache(owner: str, repo: str, mermaid_code: str) -> None:
    """Save diagram to cache."""
    cache_path = _get_cache_path(owner, repo)
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump({
                "owner": owner,
                "repo": repo,
                "mermaid": mermaid_code,
                "cached_at": datetime.now().isoformat()
            }, f, indent=2)
        print(f"💾 Cached diagram for {owner}/{repo}", flush=True)
    except Exception as e:
        print(f"⚠️ Failed to cache diagram: {e}", flush=True)


async def fetch_gitdiagram(owner: str, repo: str, github_pat: Optional[str] = None, force_refresh: bool = False) -> str:
    """
    Fetch the Mermaid diagram from GitDiagram's API with caching.
    
    Args:
        owner: GitHub username/org
        repo: Repository name
        github_pat: Optional GitHub personal access token for private repos
        force_refresh: If True, bypass cache and fetch fresh diagram
        
    Returns:
        Mermaid diagram code string
    """
    # Check cache first (unless force refresh)
    if not force_refresh:
        cached = _get_cached_diagram(owner, repo)
        if cached:
            return cached
    
    print(f"🌐 Fetching fresh diagram from GitDiagram for {owner}/{repo}...", flush=True)
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # GitDiagram uses a streaming API
            payload = {
                "username": owner,
                "repo": repo,
                "instructions": ""
            }
            if github_pat:
                payload["github_pat"] = github_pat
            
            mermaid_code = ""
            
            # Try the streaming endpoint
            async with client.stream(
                "POST",
                f"{GITDIAGRAM_API}/generate/stream",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status_code != 200:
                    return f"graph TD\n    A[GitDiagram Error: {response.status_code}]"
                
                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        try:
                            data = json.loads(line[5:].strip())
                            if data.get("status") == "diagram_chunk":
                                mermaid_code += data.get("chunk", "")
                            elif data.get("status") == "complete":
                                if "diagram" in data:
                                    mermaid_code = data["diagram"]
                            elif "error" in data:
                                return f"graph TD\n    A[Error: {data['error'][:50]}...]"
                        except json.JSONDecodeError:
                            continue
            
            # Clean up the mermaid code
            mermaid_code = mermaid_code.strip()
            mermaid_code = mermaid_code.replace("```mermaid", "").replace("```", "").strip()
            
            if not mermaid_code:
                return "graph TD\n    A[No diagram generated]"
            
            # Save to cache
            _save_to_cache(owner, repo, mermaid_code)
            
            return mermaid_code
            
    except httpx.TimeoutException:
        return "graph TD\n    A[GitDiagram Timeout - Try again]"
    except Exception as e:
        return f"graph TD\n    A[Error: {str(e)[:50]}]"


def extract_owner_repo(github_url: str) -> tuple[str, str]:
    """Extract owner and repo from a GitHub URL."""
    # Handle various GitHub URL formats
    patterns = [
        r"github\.com/([^/]+)/([^/]+?)(?:\.git)?(?:/|$)",
        r"^([^/]+)/([^/]+)$"  # Simple owner/repo format
    ]
    
    for pattern in patterns:
        match = re.search(pattern, github_url)
        if match:
            return match.group(1), match.group(2)
    
    raise ValueError(f"Could not parse GitHub URL: {github_url}")


def clear_cache(owner: str = None, repo: str = None) -> int:
    """Clear diagram cache. If owner/repo specified, clear only that entry."""
    if owner and repo:
        cache_path = _get_cache_path(owner, repo)
        if os.path.exists(cache_path):
            os.remove(cache_path)
            return 1
        return 0
    
    # Clear all cache
    count = 0
    if os.path.exists(CACHE_DIR):
        for f in os.listdir(CACHE_DIR):
            if f.endswith(".json"):
                os.remove(os.path.join(CACHE_DIR, f))
                count += 1
    return count


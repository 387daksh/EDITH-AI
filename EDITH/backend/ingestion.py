import os
import shutil
import git
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
REPO_DIR = os.path.join(DATA_DIR, "repos")

def clone_repo(repo_url: str) -> str:
    """
    Clones a GitHub repository to the local data directory.
    Returns the path to the cloned repository.
    """
    print(f"\n{'='*60}", flush=True)
    print(f"🔄 CLONING REPOSITORY", flush=True)
    print(f"   URL: {repo_url}", flush=True)
    print(f"{'='*60}\n", flush=True)
    
    if not os.path.exists(REPO_DIR):
        os.makedirs(REPO_DIR, exist_ok=True)
    
    repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
    local_path = os.path.join(REPO_DIR, repo_name)
    
    if os.path.exists(local_path):
        print(f"📁 Removing existing repo at {local_path}...", flush=True)
        try:
            shutil.rmtree(local_path)
        except PermissionError:
            print(f"⚠️ Could not remove (files locked), using existing...", flush=True)
            
    if not os.path.exists(local_path):
        print(f"⬇️ Cloning from GitHub (this may take a minute)...", flush=True)
        git.Repo.clone_from(repo_url, local_path)
        print(f"✅ Clone complete!", flush=True)
    
    return local_path

# Avoid global imports that run on startup
from langchain_text_splitters import PythonCodeTextSplitter, RecursiveCharacterTextSplitter

def process_repo(repo_path: str) -> List[Dict[str, Any]]:
    from backend.graph import DependencyGraph  # Local import to prevent circular issues
    
    # Initialize graph locally for this ingestion run
    dep_graph = DependencyGraph()
    """
    Walks the repository, reads text files, and chunks them.
    Also builds the dependency graph.
    """
    print(f"\n{'='*60}", flush=True)
    print(f"📂 PROCESSING REPOSITORY: {repo_path}", flush=True)
    print(f"{'='*60}\n", flush=True)
    
    documents = []
    
    # 1. Code Splitter (AST-based) for Python
    python_splitter = PythonCodeTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200
    )
    # 2. Generic Splitter for others
    generic_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200
    )

    exclude_dirs = {'.git', 'venv', '__pycache__', 'node_modules', '.idea', '.vscode', 'dist', 'build', '.tox', 'eggs', '.eggs'}
    exclude_exts = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.exe', '.bin', '.pyc', '.whl', '.zip', '.tar', '.gz', '.lock'}

    file_count = 0
    processed_file_count = 0
    chunk_count = 0

    # First pass: count files
    total_files = 0
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in exclude_exts:
                total_files += 1
    
    print(f"📊 Found {total_files} files to process\n", flush=True)

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            file_count += 1
            ext = os.path.splitext(file)[1].lower()
            if ext in exclude_exts:
                continue
                
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, repo_path).replace("\\", "/")
            
            try:
                # 1. Graph Analysis (Python only)
                if ext == '.py':
                    dep_graph.parse_imports(file_path, repo_path)

                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    
                if not content.strip():
                    continue

                # 2. Select Splitter
                if ext == '.py':
                    chunks = python_splitter.split_text(content)
                else:
                    chunks = generic_splitter.split_text(content)
                
                for i, chunk in enumerate(chunks):
                    documents.append({
                        "id": f"{rel_path}:{i}",
                        "content": chunk,
                        "metadata": {
                            "source": rel_path,
                            "chunk_index": i,
                            "language": "python" if ext == '.py' else "text"
                        }
                    })
                processed_file_count += 1
                chunk_count += len(chunks)
                
                # Progress logging every 20 files
                if processed_file_count % 20 == 0:
                    print(f"📄 Processed {processed_file_count}/{total_files} files ({chunk_count} chunks)...", flush=True)
                    
            except Exception as e:
                print(f"❌ Error reading {rel_path}: {e}", flush=True)

    # Save Graph
    graph_path = os.path.join(DATA_DIR, "dependency_graph.gml")
    dep_graph.save(graph_path)
    print(f"\n📊 Dependency Graph saved ({dep_graph.graph.number_of_nodes()} nodes, {dep_graph.graph.number_of_edges()} edges)", flush=True)
    
    print(f"\n{'='*60}", flush=True)
    print(f"✅ CHUNKING COMPLETE!", flush=True)
    print(f"   Files processed: {processed_file_count}", flush=True)
    print(f"   Chunks generated: {chunk_count}", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"\n⏳ Now embedding chunks (this takes time on first run)...\n", flush=True)
    
    return documents


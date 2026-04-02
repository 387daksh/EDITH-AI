"""
Lightweight in-memory HR context store and retrieval.

This module provides a simple HR memory structure and a keyword-based
retrieval function. It's intentionally independent from the code-domain
vector store and does not modify any existing files.

Functions:
 - add_hr_doc(title, content)
 - list_hr_docs()
 - retrieve_top_k(question, k=3)

The retrieval is a simple keyword-match scoring to avoid adding heavy
dependencies. It is sufficient for demo/hackathon usage and meets the
requirement that HR logic be separate from code-domain logic.
"""
from typing import List, Dict, Any
import threading
import re
import json
import os

# Global in-memory HR memory. Thread-safe via a lock for simple concurrency.
_hr_memory: Dict[str, Any] = {
    "docs": []  # each doc: {"id": int, "title": str, "content": str}
}
_hr_lock = threading.Lock()
_next_id = 1
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
_PERSIST_PATH = os.path.join(DATA_DIR, "hr_docs.json")


def _load_persisted():
    global _next_id
    try:
        if os.path.exists(_PERSIST_PATH):
            with open(_PERSIST_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                docs = data.get("docs", [])
                if isinstance(docs, list):
                    _hr_memory["docs"] = docs
                    max_id = 0
                    for d in docs:
                        if isinstance(d.get("id"), int) and d.get("id") > max_id:
                            max_id = d.get("id")
                    _next_id = max_id + 1
    except Exception:
        # If persistence fails, proceed with empty memory
        pass


def _save_persisted():
    try:
        os.makedirs(os.path.dirname(_PERSIST_PATH), exist_ok=True)
        with open(_PERSIST_PATH, "w", encoding="utf-8") as f:
            json.dump({"docs": _hr_memory.get("docs", [])}, f, ensure_ascii=False, indent=2)
    except Exception:
        # best-effort persistence; ignore failures
        pass


def _tokenize(text: str) -> List[str]:
    # very small tokenizer: split on non-word, remove short tokens
    tokens = re.split(r"\W+", text.lower())
    return [t for t in tokens if len(t) > 2]


def add_hr_doc(title: str, content: str) -> Dict[str, Any]:
    """Add an HR document to memory and return the stored entry."""
    global _next_id
    if not title or not content:
        raise ValueError("Both title and content are required")

    with _hr_lock:
        doc = {"id": _next_id, "title": title.strip(), "content": content.strip()}
        _hr_memory["docs"].append(doc)
        _next_id += 1
        # persist
        _save_persisted()
    return doc


def list_hr_docs() -> List[Dict[str, Any]]:
    """Return a copy of all HR docs."""
    with _hr_lock:
        return [dict(d) for d in _hr_memory["docs"]]


def retrieve_top_k(question: str, k: int = 3) -> List[Dict[str, Any]]:
    """
    Retrieve top-k HR docs using a simple keyword-match scoring.

    Scoring:
      - Count overlap of question tokens with doc tokens
      - Title matches are weighted higher

    Returns a list ordered by descending score. If no docs or no matches,
    returns an empty list.
    """
    if not question or not question.strip():
        return []

    with _hr_lock:
        docs = list(_hr_memory["docs"])  # shallow copy

    if not docs:
        return []

    q_tokens = _tokenize(question)
    if not q_tokens:
        return []

    scored = []
    for doc in docs:
        content_tokens = _tokenize(doc.get("content", ""))
        title_tokens = _tokenize(doc.get("title", ""))

        # simple overlap counts
        content_matches = sum(1 for t in q_tokens if t in content_tokens)
        title_matches = sum(1 for t in q_tokens if t in title_tokens)

        # score: title matches weighted x3
        score = content_matches + (3 * title_matches)

        # small length normalization to prefer concise strong matches
        norm = max(1, len(content_tokens) / 200)
        score = score / norm

        if score > 0:
            scored.append((score, doc))

    if not scored:
        return []

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [d for _, d in scored[:k]]
    return top


# Load persisted docs at module import time (best-effort)
_load_persisted()

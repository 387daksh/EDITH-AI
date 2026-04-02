
import os
import json
import io
import re
import hashlib
from typing import List, Dict, Any
from functools import lru_cache
import pypdf

try:
    from groq import Groq
    _GROQ_AVAILABLE = True
except Exception:
    _GROQ_AVAILABLE = False

_groq_client = None
if _GROQ_AVAILABLE:
    try:
        _groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    except Exception:
        _groq_client = None

def clean_text(text: str) -> str:
    """Removes excessive whitespace and newlines to save tokens."""
    # Replace multiple newlines with single newline
    text = re.sub(r'\n+', '\n', text)
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts and cleans text content from a PDF file."""
    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return clean_text(text)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

# Simple in-memory cache for LLM responses
_llm_cache: Dict[str, Dict[str, Any]] = {}

def _get_cache_key(prompt: str) -> str:
    """Generates a stable hash for the prompt."""
    return hashlib.md5(prompt.encode('utf-8')).hexdigest()

def _call_llm_json(prompt: str) -> Dict[str, Any]:
    """Helper to call LLM and expect JSON response, with caching."""
    if not _groq_client:
        return {"error": "LLM client not available"}
    
    # Check cache
    cache_key = _get_cache_key(prompt)
    if cache_key in _llm_cache:
        print(f"CACHE HIT: {cache_key}")
        return _llm_cache[cache_key]
    
    try:
        chat_completion = _groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        result = json.loads(chat_completion.choices[0].message.content)
        
        # Store in cache (limit size naively for now)
        if len(_llm_cache) > 100:
            _llm_cache.clear()
        _llm_cache[cache_key] = result
        
        return result
    except Exception as e:
        print(f"LLM call error: {e}")
        return {"error": str(e)}

def parse_resume_data(text: str) -> Dict[str, Any]:
    """Uses LLM to extract structured data from resume text."""
    # Token Optimization: Clean text and limit chars strictly
    cleaned = clean_text(text)[:3500] 
    
    prompt = f"""
    Extract resume data to JSON (name, email, phone, skills[], experience[{{role,company,duration,desc}}], education[{{degree,uni,year}}], summary).
    
    RESUME:
    {cleaned}
    """
    return _call_llm_json(prompt)

def generate_interview_questions(resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
    """Generates interview questions based on resume and JD."""
    # Token Optimization: Minify JSON input
    resume_str = json.dumps(resume_data, separators=(',', ':'))
    jd_clean = clean_text(job_description)[:2000]
    
    prompt = f"""
    Generate interview questions in strict JSON format with exactly these two keys: "technical" (array of strings) and "behavioral" (array of strings).
    
    RESUME: {resume_str}
    JD: {jd_clean}
    """
    result = _call_llm_json(prompt)
    print(f"DEBUG Questions Generated: {result}")
    return result

def evaluate_candidate(resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
    """Evaluates candidate fit for the job."""
    resume_str = json.dumps(resume_data, separators=(',', ':'))
    jd_clean = clean_text(job_description)[:2000]
    
    prompt = f"""
    Evaluate candidate (JSON: match_score(0-100), pros[], cons[], reasoning, recommendation).
    
    RESUME: {resume_str}
    JD: {jd_clean}
    """
    return _call_llm_json(prompt)

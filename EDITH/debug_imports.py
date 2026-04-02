import sys
import traceback

print("1. Starting check...", flush=True)

try:
    print("2. Importing fastapi...", flush=True)
    from fastapi import FastAPI
    print("3. Importing pydantic...", flush=True)
    from pydantic import BaseModel
    print("4. Importing dotenv...", flush=True)
    from dotenv import load_dotenv
    print("5. Importing backend.graph...", flush=True)
    from backend.graph import DependencyGraph
    print("6. Importing backend.reasoning...", flush=True)
    from backend.reasoning import answer_question
    print("7. Importing backend.ingestion...", flush=True)
    from backend.ingestion import clone_repo, process_repo
    print("8. Importing backend.main...", flush=True)
    import backend.main
    print("9. SUCCESS: backend.main imported!", flush=True)

except Exception:
    print("\nCRITICAL FAILURE:", flush=True)
    traceback.print_exc()
    sys.exit(1)

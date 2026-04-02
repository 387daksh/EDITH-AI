import sys
print(f"Python executable: {sys.executable}")
print("Attempting to import networkx...")
try:
    import networkx
    print(f"NetworkX version: {networkx.__version__}")
except ImportError as e:
    print(f"FAILED to import networkx: {e}")
    sys.exit(1)

print("Attempting to import backend.main...")
try:
    from backend.main import app
    print("Successfully imported backend.main")
except Exception as e:
    print(f"FAILED to import backend.main: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

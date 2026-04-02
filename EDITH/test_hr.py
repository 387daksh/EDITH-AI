import sys
import os

# Add root directory to path
sys.path.append(os.getcwd())

try:
    from backend.hr_advanced import get_performance_stats, get_leave_info, request_leave, get_onboarding_tasks, toggle_onboarding_task
    print("✅ Import successful")
except Exception as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)

try:
    print("Testing Performance...")
    perf = get_performance_stats("test@example.com")
    print(f"Performance: {perf.keys()}")

    print("Testing Leaves...")
    leaves = get_leave_info("test@example.com")
    print(f"Leaves: {leaves.keys()}")

    print("Testing Onboarding...")
    tasks = get_onboarding_tasks("test@example.com")
    print(f"Onboarding tasks: {len(tasks)}")

    print("✅ All tests passed")
except Exception as e:
    print(f"❌ Runtime error: {e}")
    import traceback
    traceback.print_exc()

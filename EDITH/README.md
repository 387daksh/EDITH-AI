# EDITH: Persistent Organizational AI

EDITH (Enterprise Data Intelligence & Technical Hub) is a hackathon project designed to help developers and HR teams understand large organizations through RAG (Retrieval-Augmented Generation). It ingests your codebase and HR documents to provide intelligent answers and insights.

## Features

- **Codebase RAG**: Ingest git repositories and ask technical questions.
- **HR Intelligence**: Manage performance reviews, leave requests, and onboarding tasks.
- **Risk Radar**: Analyze organizational risk based on various metrics.
- **Role-Based Access**: Specialized views for Admin, HR, and Employees.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- **Python 3.9+**
- **Node.js 16+** & **npm**
- **Git**

### 1. Backend Setup

The backend is built with FastAPI and handles data ingestion, authentication, and RAG logic.

1.  **Navigate to the project root:**

    ```bash
    cd e:\EDITH\EDITH
    ```

2.  **Create a virtual environment:**

    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    - **Windows (PowerShell):**
      ```powershell
      .\venv\Scripts\activate
      ```
    - **Mac/Linux:**
      ```bash
      source venv/bin/activate
      ```

4.  **Install Python dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

5.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your API keys:

    ```env
    # Required for LLM reasoning (Groq is recommended for speed)
    GROQ_API_KEY=gsk_...

    # Optional: OpenAI (if preferred)
    # OPENAI_API_KEY=sk-...
    ```

6.  **Populate Dummy Data:**
    Run this script to generate users, performance reviews, and leave data:

    ```bash
    python populate_hr_data.py
    ```

7.  **Start the Backend Server:**
    ```bash
    uvicorn backend.main:app --reload
    ```
    The backend will run at `http://127.0.0.1:8000`.

### 2. Frontend Setup

The frontend is a React application built with Vite.

1.  **Open a new terminal and navigate to the frontend directory:**

    ```bash
    cd frontend/stitch
    ```

2.  **Install Node dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Frontend Environment:**
    Create a `.env` file in `frontend/stitch` if you plan to use client-side AI features (optional):

    ```env
    # Optional: For Google Gemini integrations on the client side
    GEMINI_API_KEY=...
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The frontend will typically run at `http://localhost:5173`.

---

## 🔑 Default Credentials

Use these credentials to test different roles in the application.

| Role         | Email            | Password   | Access Level                                                  |
| :----------- | :--------------- | :--------- | :------------------------------------------------------------ |
| **Admin**    | `daksh@edith.ai` | `admin123` | Full access to all modules, including Ingestion & Risk Radar. |
| **HR**       | `somya@edith.ai` | `edith123` | Access to HR Domain, Recruitment, and Employee Management.    |
| **Employee** | `syna@edith.ai`  | `edith123` | Access to Personal Stats, Team View, and Assigned Codebases.  |

_Other employees (e.g., `dhruv@edith.ai`, `kanav@edith.ai`) also use the password `edith123`._

---

## 🛠 Usage Guide

1.  **Log In**: Open the frontend URL and log in with one of the credentials above.
2.  **Ingest Code**:
    - Log in as **Admin**.
    - Go to **Code Domain**.
    - Enter a GitHub URL (e.g., `https://github.com/fastapi/fastapi`) and click **Ingest**.
3.  **Ask Questions**:
    - Use **Ask EDITH** to query the ingested codebase.
    - Example: _"How does the auth dependency work?"_
4.  **HR Actions**:
    - Log in as **HR** to view specific HR dashboards.
    - Log in as **Employee** to request leave or view performance stats.

## Troubleshooting

- **"Module not found" errors**: Ensure your virtual environment is activated (`venv\Scripts\activate`) before running python commands.
- **Frontend connection issues**: Ensure the backend is running on port `8000`.
- **Missing Data**: If the dashboard is empty, make sure you ran `python populate_hr_data.py`.

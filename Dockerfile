FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY EDITH/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy only runtime backend code and required data files
COPY EDITH/backend ./EDITH/backend
COPY EDITH/data ./EDITH/data

# Expose port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "EDITH.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

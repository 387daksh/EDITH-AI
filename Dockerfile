FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY EDITH/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY EDITH ./EDITH

# Expose port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "EDITH.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

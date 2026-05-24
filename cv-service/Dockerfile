FROM python:3.11-slim

# System deps for OpenCV (used by ultralytics)
RUN apt-get update && apt-get install -y \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Model weights are mounted as a Railway volume at /app/model/
# or injected via MODEL_PATH env var pointing to a downloaded file

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
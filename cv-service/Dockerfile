FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Download model from Google Drive on startup
RUN mkdir -p /app/model

CMD ["sh", "-c", "gdown https://drive.google.com/file/d/1axZZyPOFDmIs9Eq0HtYRMpR3Q3vRJMt7/view?usp=sharing -O /app/model/yolov8_rdd2022_v3_best.pt && uvicorn main:app --host 0.0.0.0 --port 8000"]
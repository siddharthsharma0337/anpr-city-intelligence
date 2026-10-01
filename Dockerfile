# ============================================================
# ANPR City Intelligence — Multi-Service Docker Image
# Node.js 20 (Express/Socket.IO) + Python 3.11 (YOLO/OCR AI)
# ============================================================
FROM python:3.11-slim

# Install system dependencies + Node.js 20
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Python Dependencies ----
# Copy and install Python deps first (better Docker layer caching)
COPY AI-Model/requirements.txt ./AI-Model/requirements.txt

# Install CPU-only PyTorch (Render doesn't have GPU; saves 3GB+ of image size)
RUN pip install --no-cache-dir torch==2.1.0 torchvision==0.16.0 --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies
RUN pip install --no-cache-dir \
    ultralytics==8.4.127 \
    opencv-python-headless==4.9.0.80 \
    "fast-plate-ocr[onnx-cpu]>=1.1.0" \
    pymongo==4.18.1

# ---- Copy AI Model ----
COPY AI-Model/ ./AI-Model/

# ---- Node.js Dependencies ----
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# ---- Copy Server Source ----
COPY server/ ./server/

# ---- Create Required Directories ----
RUN mkdir -p /app/server/uploads

# ---- Environment Defaults ----
ENV PORT=5000
ENV NODE_ENV=production
ENV PYTHON_PATH=python3
ENV AI_MODEL_PATH=/app/AI-Model/models/custom_trained_model.pt

EXPOSE 5000

# Health check so Render knows when the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server/src/server.js"]

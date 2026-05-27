# ===================== FRONTEND BUILD =====================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

RUN apk add --no-cache python3 make g++

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/. .

RUN npm run build

# ===================== BACKEND BUILD =====================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci

COPY backend/. .

RUN npm run build

# ===================== PRODUCTION =====================
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl python3 make g++

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev --ignore-scripts && \
    npm rebuild better-sqlite3
WORKDIR /app

# Copy backend dist
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy migrations
COPY --from=backend-builder /app/backend/drizzle ./backend/drizzle

# Copy frontend dist from frontend builder
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN mkdir -p data && chmod 777 data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENV NODE_ENV=production

CMD ["node", "backend/dist/index.js"]

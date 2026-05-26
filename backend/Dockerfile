# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy backend package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy backend source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install curl and build dependencies for better-sqlite3
RUN apk add --no-cache curl python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies only (with rebuild for better-sqlite3)
RUN npm ci --omit=dev --ignore-scripts && \
    npm rebuild better-sqlite3

# Copy built backend
COPY --from=builder /app/dist ./dist

# Create frontend and data directories (will be populated at runtime if needed)
RUN mkdir -p frontend/dist data && chmod 777 data frontend/dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/index.js"]

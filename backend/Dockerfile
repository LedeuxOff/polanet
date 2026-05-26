FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm rebuild better-sqlite3

COPY --from=builder /app/dist ./dist

# Copy pre-built frontend
COPY frontend/dist ./frontend/dist

RUN mkdir -p data && chmod 777 data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]

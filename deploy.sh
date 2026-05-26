#!/bin/bash

# Polanet Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-production}

echo -e "${GREEN}=== Polanet Deployment Script ===${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"
DEPLOY_USER="deploy"
DEPLOY_HOST="admin-polanet.ru"
DEPLOY_PATH="/home/${DEPLOY_USER}/polanet"

# Check required environment files
if [[ ! -f "${BACKEND_DIR}/.env.production" ]]; then
    echo -e "${RED}Error: ${BACKEND_DIR}/.env.production not found!${NC}"
    echo -e "${YELLOW}Please create .env.production from .env.example${NC}"
    exit 1
fi

# Check if running on remote server or deploying via SSH
if [[ "${ENVIRONMENT}" == "local" ]]; then
    echo -e "${GREEN}Running local deployment...${NC}"
    
    # Install backend dependencies
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "${BACKEND_DIR}"
    npm ci --production
    
    # Install frontend dependencies
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "${FRONTEND_DIR}"
    npm ci
    
    # Build frontend
    echo -e "${YELLOW}Building frontend...${NC}"
    npm run build
    
    # Build backend
    echo -e "${YELLOW}Building backend...${NC}"
    cd "${BACKEND_DIR}"
    npm run build
    
    # Run migrations
    echo -e "${YELLOW}Running database migrations...${NC}"
    npm run db:migrate
    
    # Seed database (only if empty)
    echo -e "${YELLOW}Seeding database...${NC}"
    npm run db:seed
    
    echo -e "${GREEN}=== Local deployment completed! ===${NC}"
    exit 0
fi

# Step 2: Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd "${FRONTEND_DIR}"
npm ci
npm run build

# Step 3: Build backend
echo -e "${YELLOW}Building backend...${NC}"
cd "${BACKEND_DIR}"
npm ci --production
npm run build

# Step 4: Deploy to server
echo -e "${YELLOW}Deploying to server...${NC}"

# Create deployment directory on remote server
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}"

# Copy files
scp -r "${BACKEND_DIR}/dist" ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/
scp -r "${FRONTEND_DIR}/dist" ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/frontend/
scp "${BACKEND_DIR}/package*.json" ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/
scp "${FRONTEND_DIR}/package*.json" ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/frontend/
scp "${BACKEND_DIR}/.env.production" ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/backend/.env
scp "${SCRIPT_DIR}/docker-compose.yml" ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/docker-compose.yml
scp -r "${SCRIPT_DIR}/nginx" ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/nginx/

# Step 5: Run remote deployment
ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/backend && npm ci --production && npm run db:migrate && npm run db:seed"

echo -e "${GREEN}=== Deployment completed! ===${NC}"
echo -e "Frontend: https://admin-polanet.ru"
echo -e "Backend API: https://admin-polanet.ru/api"
echo -e "Telegram Bot: Configure via TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env"

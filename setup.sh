#!/bin/bash

# Color codes for better output visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

#API KEY VARIABLE
OPENAI_API_KEY=$1
CLAUDE_API_KEY=$2
GOOGLE_GENERATIVE_AI_API_KEY=$3
RABBITMQ_HOST="rabbitmq"
RABBITMQ_PORT=5672

echo -e "${BLUE}=== Forenaide Setup Script ===${NC}"
echo -e "${BLUE}This script will set up and run both the frontend and backend of Forenaide.${NC}"
echo -e "${BLUE}============================${NC}\n"

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed.${NC}"
        echo -e "Please follow the instructions in README-SETUP.md to install the required tools."
        exit 1
    fi
}

# Check for required tools
echo -e "${YELLOW}Checking for required tools...${NC}"
check_command "docker"
check_command "npm"
check_command "python3"
check_command "pip"
check_command "pnpm"
check_command "supabase"
check_command "fastapi"

# Make sure Docker is running
echo -e "${YELLOW}Ensuring Docker is running...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Setup Python environment
pwd
echo -e "${YELLOW}Setting up Python environment...${NC}"
cd backend
pip install -r setup/requirements.txt

# Start Supabase
echo -e "${YELLOW}Starting Supabase...${NC}"
supabase start

# Get Supabase URL and key
api_url=$(supabase status --output json | grep -o '"API_URL": *"[^"]*"' | sed 's/"API_URL": *"\([^"]*\)"/\1/')
anon_key=$(supabase status --output json | grep -o '"ANON_KEY": *"[^"]*"' | sed 's/"ANON_KEY": *"\([^"]*\)"/\1/')

# Create/update .env file
echo -e "${YELLOW}Creating environment variables...${NC}"
echo "SUPABASE_URL=$api_url" > .env
echo "SUPABASE_KEY=$anon_key" >> .env
echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
echo "CLAUDE_API_KEY=$CLAUDE_API_KEY" >> .env
echo "GOOGLE_GENERATIVE_AI_API_KEY=$GOOGLE_GENERATIVE_AI_API_KEY" >> .env
echo "RABBITMQ_HOST=$RABBITMQ_HOST" >> .env
echo "RABBITMQ_PORT=$RABBITMQ_PORT" >> .env

echo -e "${GREEN}Environment variables have been set:${NC}"
echo -e "SUPABASE_URL: $api_url"
echo -e "SUPABASE_KEY: $anon_key"
echo -e "OPENAI_API_KEY: $OPENAI_API_KEY"
echo -e "CLAUDE_API_KEY: $CLAUDE_API_KEY"
echo -e "GOOGLE_GENERATIVE_AI_API_KEY: $GOOGLE_GENERATIVE_AI_API_KEY"
echo -e "RABBITMQ_HOST: $RABBITMQ_HOST"
echo -e "RABBITMQ_PORT: $RABBITMQ_PORT"

supabase functions serve --env-file .env & SUPABASE_PID=$!

# Setup frontend in a separate terminal
echo -e "${YELLOW}Setting up frontend...${NC}"
cd frontend/forenaide
pnpm install

# Start both services
echo -e "${GREEN}Starting services...${NC}"

# Function to kill background processes on script exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    # cd ../../../backend
    supabase stop
    echo -e "${GREEN}Shutdown complete.${NC}"
    exit 0
}

# Set up trap to catch SIGINT (Ctrl+C) and call cleanup function
trap cleanup SIGINT

# Start frontend in background
cd ../frontend/forenaide
echo -e "${GREEN}Starting frontend server on port 3001...${NC}"
npm run dev &
FRONTEND_PID=$!

# Start backend in background
cd ../../backend
echo -e "${GREEN}Starting backend server...${NC}"
fastapi dev api/app.py &
BACKEND_PID=$!

echo -e "\n${GREEN}All services are running!${NC}"
echo -e "${BLUE}Frontend is available at:${NC} http://localhost:3001"
echo -e "${BLUE}Backend API is available at:${NC} http://localhost:8000"
echo -e "${BLUE}API Documentation:${NC} http://localhost:8000/docs"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for user to press Ctrl+C
wait 
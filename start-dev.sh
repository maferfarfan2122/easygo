#!/bin/bash

# Easy Go - Development Start Script
# This script starts both the frontend and backend servers

echo "🚀 Starting Easy Go CV Builder..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js v24 or higher"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python is not installed${NC}"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo -e "${BLUE}📋 Checking environment...${NC}"

# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node v24
if command -v nvm &> /dev/null; then
    nvm use 24
fi

# Check if backend dependencies are installed
if [ ! -d "backend/venv" ]; then
    echo -e "${BLUE}📦 Setting up Python virtual environment...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}⚠️  Warning: backend/.env not found${NC}"
    echo "Please create backend/.env with your OPENAI_API_KEY"
    echo "You can copy backend/.env.example and add your API key"
fi

# Check if .env.local exists in frontend
if [ ! -f ".env.local" ]; then
    echo -e "${RED}⚠️  Warning: .env.local not found${NC}"
    echo "Please create .env.local with your Supabase credentials"
fi

echo -e "${GREEN}✅ Environment ready${NC}"
echo ""
echo -e "${BLUE}🔧 Starting servers...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${RED}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT INT TERM

# Start backend server
echo -e "${BLUE}🐍 Starting Python backend...${NC}"
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend server
echo -e "${BLUE}⚛️  Starting React frontend...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait a bit more
sleep 3

echo ""
echo -e "${GREEN}✅ All servers are running!${NC}"
echo ""
echo -e "${BLUE}📱 Access your application:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "   - Press Ctrl+C to stop all servers"
echo "   - Check backend/.env for OpenAI API key configuration"
echo "   - Check .env.local for Supabase credentials"
echo ""
echo -e "${BLUE}📖 For more info, read CV_BUILDER_GUIDE.md${NC}"
echo ""

# Wait for processes
wait

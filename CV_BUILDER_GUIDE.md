# 🚀 CV Builder Implementation Guide

## Quick Start

### Backend Setup (Python FastAPI)

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure OpenAI API Key:**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

5. **Start backend server:**
```bash
python main.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: `http://localhost:8000`

### Frontend Setup (React + Vite)

1. **Navigate to project root:**
```bash
cd /Users/Fernanda/Desktop/easygowebapp
```

2. **Ensure Node.js v24 is active:**
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 24
```

3. **Install dependencies (if not already done):**
```bash
npm install
```

4. **Start development server:**
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

## Testing the CV Builder

1. **Access the application:**
   - Open http://localhost:5173 in your browser

2. **Sign in or create account:**
   - Click "Sign In" in the navbar
   - Create a new account or sign in with existing credentials

3. **Navigate to CV Builder:**
   - Click on the "AI Website Builder" tool card (first one with "Try Now!" badge)
   - Or go directly to: http://localhost:5173/tools/cv-builder

4. **Fill out the CV form:**
   - **Step 1:** Paste a job description
   - Click "Get AI Suggestions" to see recommendations
   - **Step 2:** Enter personal information
   - **Step 3:** Add work experience
   - **Step 4:** Add education
   - **Step 5:** Add skills and languages
   - **Step 6:** Generate optimized CV with AI

5. **Generate PDF:**
   - Click "Generate Optimized CV (with AI)" for AI-optimized version
   - Or click "Generate Standard CV" for faster generation without AI

## API Endpoints

### Backend (http://localhost:8000)

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/cv/suggestions` - Get AI suggestions for CV
- `POST /api/cv/optimize` - Optimize CV content with GPT-4
- `POST /api/cv/generate` - Generate optimized PDF
- `POST /api/cv/generate-without-optimization` - Generate standard PDF

### Interactive API Docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Architecture

```
React Frontend (localhost:5173)
    ↓
    ↓ HTTP POST
    ↓
FastAPI Backend (localhost:8000)
    ↓
    ↓ API Call
    ↓
OpenAI GPT-4 API
    ↓
    ↓ Optimized Content
    ↓
ReportLab PDF Generator
    ↓
    ↓ PDF File
    ↓
User Download
```

## Features

✅ Multi-step form with progress bar
✅ AI-powered CV optimization based on job description
✅ Real-time suggestions from GPT-4
✅ Professional PDF generation
✅ Protected routes (must be logged in)
✅ Supabase authentication
✅ Responsive design

## File Structure

```
easygowebapp/
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment variables (OpenAI key)
│   ├── models/
│   │   └── cv_models.py        # Pydantic models
│   ├── services/
│   │   ├── openai_service.py   # GPT-4 integration
│   │   └── pdf_generator.py    # PDF generation
│   └── generated_cvs/          # Output directory (auto-created)
│
├── src/
│   ├── components/
│   │   ├── CVBuilder.jsx       # Main CV Builder component
│   │   ├── Tools.jsx           # Updated with clickable CV card
│   │   ├── Navbar.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── lib/
│   │   └── supabase.js         # Supabase client
│   ├── App.tsx                 # Main app with routes
│   └── App.css                 # Styles including CV Builder
│
├── .env.local                  # Frontend environment variables
└── package.json
```

## Troubleshooting

### Backend Issues

**Problem:** "OPENAI_API_KEY no configurada"
**Solution:** Make sure you created `.env` file in `backend/` directory with your API key

**Problem:** "Module not found" errors
**Solution:** Make sure virtual environment is activated and dependencies are installed:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Problem:** Port 8000 already in use
**Solution:** Change port in `backend/.env`:
```
PORT=8001
```

### Frontend Issues

**Problem:** "Cannot import CVBuilder"
**Solution:** Make sure TypeScript is configured with `allowJs: true` in `tsconfig.app.json`

**Problem:** CORS errors when calling API
**Solution:** Make sure backend CORS is configured correctly and both servers are running

**Problem:** Node.js version issues
**Solution:** Use Node.js v24:
```bash
nvm use 24
```

## Next Steps

1. **Customize PDF Template:**
   - Edit `backend/services/pdf_generator.py`
   - Modify colors, fonts, layout

2. **Add More Fields:**
   - Edit `backend/models/cv_models.py`
   - Update `src/components/CVBuilder.jsx` form

3. **Improve AI Prompts:**
   - Edit `backend/services/openai_service.py`
   - Customize prompts for better optimization

4. **Deploy to Production:**
   - See `backend/README.md` for IONOS VPS deployment instructions
   - Configure production URLs in environment variables

## Support

If you need help:
1. Check API documentation: http://localhost:8000/docs
2. Check browser console for frontend errors
3. Check terminal for backend errors
4. Review this guide and backend/README.md

## Security Notes

- Never commit `.env` files to git
- Keep your OpenAI API key private
- Use environment variables for all sensitive data
- Enable row-level security in Supabase

---

**Made with ❤️ for Easy Go - AI Website Builder**
